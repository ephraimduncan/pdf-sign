const { writeFileSync, readFileSync } = require("fs");
const { join } = require("path");
const PDFDocument = require("pdf-lib").PDFDocument;
const signpdf = require("@signpdf/signpdf").default;
const { P12Signer } = require("@signpdf/signer-p12");
const { pdflibAddPlaceholder } = require("@signpdf/placeholder-pdf-lib");

const createPDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 500]);

    page.drawText("Hello!", {
        x: 50,
        y: 450,
        size: 24,
    });

    const pdfBytes = await pdfDoc.save();
    writeFileSync(join(__dirname, "../", "export", "output.pdf"), pdfBytes);
};

const signPDF = async () => {
    const p12Buffer = readFileSync(join(__dirname, "../resources", "certificate.p12"));
    const pdfBuffer = readFileSync(join(__dirname, "../", "export", "output.pdf"));
    const signer = new P12Signer(p12Buffer);

    PDFDocument.load(pdfBuffer).then((pdfDoc) => {
        pdflibAddPlaceholder({
            pdfDoc: pdfDoc,
            reason: "Signing Document",
            contactInfo: "ephraim@documenso.com",
            name: "Ephraim Duncan",
            location: "VSCode, Macbook",
        });

        pdfDoc.save().then((pdfWithPlaceholderBytes) => {
            signpdf.sign(pdfWithPlaceholderBytes, signer).then((signedPdfBuffer) => {
                writeFileSync(join(__dirname, "../", "export", "signed.pdf"), signedPdfBuffer);
                console.log("PDF signed successfully!");
            });
        });
    });
};

createPDF().then(() => {
    signPDF();
});
