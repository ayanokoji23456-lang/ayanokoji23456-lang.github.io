const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const CATALOG_FILE = path.join(ROOT, 'produtos.json');
const UPLOAD_DIR = path.join(ROOT, 'floricultura files');
const PIN_FILE = path.join(ROOT, 'painel.pin');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
let panelPin = process.env.PANEL_PIN || '1234';
const sessions = new Map();
const app = express();
const upload = multer({
    dest: UPLOAD_DIR,
    limits: { files: 12, fileSize: 8 * 1024 * 1024 },
    fileFilter: (request, file, callback) => callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype))
});

app.use(express.json({ limit: '2mb' }));
app.use((request, response, next) => {
    if (['/server.js', '/painel.pin', '/package.json', '/package-lock.json'].includes(request.path)) return response.sendStatus(404);
    next();
});
app.get('/', (request, response) => response.redirect('/painel.html'));
app.use(express.static(ROOT));

function readCookies(request) {
    return Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map((part) => {
        const separator = part.indexOf('=');
        return [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())];
    }));
}

function requireSession(request, response, next) {
    const token = readCookies(request).petala_session;
    if (!token || !sessions.has(token)) return response.status(401).json({ error: 'Não autenticado.' });
    next();
}

async function readCatalog() { return JSON.parse(await fs.readFile(CATALOG_FILE, 'utf8')); }
async function writeCatalog(catalog) { await fs.writeFile(CATALOG_FILE, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8'); }
function getCategory(catalog, category) { return category.split('.').reduce((value, key) => value && value[key], catalog); }
function safeFileName(originalName) {
    const extension = path.extname(originalName).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    return `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${allowed.includes(extension) ? extension : '.bin'}`;
}
function storedImagePath(image) {
    if (typeof image !== 'string') return null;
    const normalized = image.replace(/\\/g, '/');
    const filename = normalized.startsWith('floricultura files/') ? normalized.slice('floricultura files/'.length) : normalized.includes('/') ? null : normalized;
    if (!filename || filename.includes('/') || filename === '.' || filename === '..') return null;
    return path.join(UPLOAD_DIR, filename);
}
async function removeStoredImages(images) {
    await Promise.all(images.map((image) => {
        const filePath = storedImagePath(image);
        return filePath ? fs.rm(filePath, { force: true }) : Promise.resolve();
    }));
}

app.post('/api/login', async (request, response) => {
    if (request.body.pin !== panelPin) return response.status(401).json({ error: 'PIN incorreto.' });
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, Date.now());
    response.setHeader('Set-Cookie', `petala_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);
    response.json({ ok: true });
});

app.post('/api/logout', requireSession, (request, response) => {
    sessions.delete(readCookies(request).petala_session);
    response.setHeader('Set-Cookie', 'petala_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    response.json({ ok: true });
});

app.get('/api/catalog', requireSession, async (request, response) => response.json(await readCatalog()));
app.put('/api/catalog', requireSession, async (request, response) => {
    await writeCatalog(request.body);
    response.json(request.body);
});
app.post('/api/category', requireSession, async (request, response) => {
    const category = String(request.body.category || '').trim();
    if (!category || /[.\\/]/.test(category) || ['__proto__', 'constructor', 'prototype'].includes(category)) return response.status(400).json({ error: 'Nome de lista inválido.' });
    const catalog = await readCatalog();
    if (Object.prototype.hasOwnProperty.call(catalog, category)) return response.status(409).json({ error: 'Essa lista já existe.' });
    catalog[category] = [];
    await writeCatalog(catalog);
    response.json(catalog);
});

app.post('/api/product', requireSession, upload.array('images'), async (request, response) => {
    const catalog = await readCatalog();
    const action = request.body.action;
    const category = request.body.category;
    const oldCategory = request.body.oldCategory;
    const oldIndex = Number(request.body.oldIndex);
    const target = getCategory(catalog, category);
    if (!Array.isArray(target)) return response.status(400).json({ error: 'Categoria inválida.' });

    if (action === 'delete' || action === 'update') {
        const source = getCategory(catalog, oldCategory);
        if (!Array.isArray(source) || !Number.isInteger(oldIndex) || !source[oldIndex]) return response.status(400).json({ error: 'Produto inválido.' });
        const oldProduct = source[oldIndex];
        source.splice(oldIndex, 1);
        if (action === 'delete') await removeStoredImages(oldProduct.imagens || []);
        request.oldProduct = oldProduct;
    }
    if (action !== 'delete') {
        const product = JSON.parse(request.body.product);
        const existingImages = JSON.parse(request.body.existingImages || '[]');
        const oldProduct = request.oldProduct;
        if (oldProduct) await removeStoredImages((oldProduct.imagens || []).filter((image) => !existingImages.includes(image)));
        const newImages = [];
        for (const file of request.files || []) {
            const filename = safeFileName(file.originalname);
            await fs.rename(file.path, path.join(UPLOAD_DIR, filename));
            newImages.push(`floricultura files/${filename}`);
        }
        product.imagens = existingImages.concat(newImages);
        target.push(product);
    }
    await writeCatalog(catalog);
    response.json(catalog);
});

app.post('/api/change-pin', requireSession, (request, response) => {
    if (request.body.current !== panelPin) return response.status(401).json({ error: 'PIN atual incorreto.' });
    if (!request.body.next || String(request.body.next).length < 4) return response.status(400).json({ error: 'O novo PIN precisa ter pelo menos 4 caracteres.' });
    panelPin = String(request.body.next);
    fs.writeFile(PIN_FILE, panelPin, 'utf8').catch(() => {});
    response.json({ ok: true });
});

app.use((error, request, response, next) => {
    if (error instanceof multer.MulterError || error) return response.status(400).json({ error: 'Não foi possível receber a imagem. Use JPG, PNG, WebP ou GIF de até 8 MB.' });
    next();
});

fs.mkdir(UPLOAD_DIR, { recursive: true }).then(async () => {
    if (!process.env.PANEL_PIN) {
        try { panelPin = (await fs.readFile(PIN_FILE, 'utf8')).trim() || panelPin; } catch {}
    }
    app.listen(PORT, HOST, () => {
        const addresses = Object.values(os.networkInterfaces()).flat().filter((address) => address && address.family === 'IPv4' && !address.internal).map((address) => `http://${address.address}:${PORT}`);
        console.log(`Pétala disponível em http://localhost:${PORT}`);
        addresses.forEach((address) => console.log(`Acesso pelo celular: ${address}/painel.html`));
    });
});