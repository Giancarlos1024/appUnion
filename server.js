const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.array('pdfFiles'), async (req, res) => {
    const inputPaths = req.files.map(file => file.path);
    const outputPath = 'public/FileNewFusion.pdf';

    try {
        await mergePDFs(inputPaths, outputPath);
        res.status(200).send('PDFs fusionados exitosamente');
    } catch (error) {
        console.error('Error al fusionar los PDFs:', error);
        res.status(500).send('Error al fusionar los PDFs');
    }
});

async function mergePDFs(inputPaths, outputPath) {
    const mergedDoc = await PDFDocument.create();

    for (const inputPath of inputPaths) {
        const pdfBytes = await fs.readFile(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        const copiedPage = await mergedDoc.copyPages(pdfDoc, [0]);
        const mergedPage = copiedPage[0];

        mergedDoc.addPage(mergedPage);
    }

    const mergedPdfBytes = await mergedDoc.save();
    await fs.writeFile(outputPath, mergedPdfBytes);
}

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
