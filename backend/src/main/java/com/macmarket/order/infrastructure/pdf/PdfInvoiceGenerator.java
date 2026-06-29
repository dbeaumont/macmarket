package com.macmarket.order.infrastructure.pdf;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import com.macmarket.order.application.service.InvoiceGenerator;
import com.macmarket.order.domain.model.Order;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

@Component
class PdfInvoiceGenerator implements InvoiceGenerator {

    @Override
    public byte[] generate(Order order) throws IOException {
        try (var doc = new PDDocument()) {
            var page = new PDPage();
            doc.addPage(page);

            try (var cs = new PDPageContentStream(doc, page)) {
                var fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                var font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
                float y = 750;

                cs.beginText();
                cs.setFont(fontBold, 24);
                cs.newLineAtOffset(50, y);
                cs.showText("MacMarket");
                cs.endText();

                y -= 30;
                cs.beginText();
                cs.setFont(fontBold, 14);
                cs.newLineAtOffset(50, y);
                cs.showText("Facture #" + order.getId().value().toString().substring(0, 8));
                cs.endText();

                y -= 20;
                cs.beginText();
                cs.setFont(font, 10);
                cs.newLineAtOffset(50, y);
                cs.showText("Date : " + order.getCreatedAt().toString().substring(0, 10));
                cs.endText();

                if (order.getShippingInfo() != null) {
                    y -= 30;
                    cs.beginText();
                    cs.setFont(fontBold, 11);
                    cs.newLineAtOffset(50, y);
                    cs.showText("Livraison");
                    cs.endText();

                    y -= 15;
                    cs.beginText();
                    cs.setFont(font, 10);
                    cs.newLineAtOffset(50, y);
                    cs.showText(order.getShippingInfo().name() + " - " + order.getShippingInfo().email());
                    cs.endText();

                    y -= 15;
                    cs.beginText();
                    cs.setFont(font, 10);
                    cs.newLineAtOffset(50, y);
                    cs.showText(order.getShippingInfo().address() != null ? order.getShippingInfo().address() : "");
                    cs.endText();
                }

                y -= 30;
                cs.beginText();
                cs.setFont(fontBold, 11);
                cs.newLineAtOffset(50, y);
                cs.showText("Articles");
                cs.endText();

                for (var item : order.getItems()) {
                    y -= 18;
                    cs.beginText();
                    cs.setFont(font, 10);
                    cs.newLineAtOffset(50, y);
                    cs.showText(item.productName() + "  x" + item.quantity() + "  " + item.subtotal() + " EUR");
                    cs.endText();
                }

                y -= 30;
                cs.beginText();
                cs.setFont(fontBold, 14);
                cs.newLineAtOffset(50, y);
                cs.showText("Total : " + order.getTotal() + " EUR");
                cs.endText();
            }

            var out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }
}
