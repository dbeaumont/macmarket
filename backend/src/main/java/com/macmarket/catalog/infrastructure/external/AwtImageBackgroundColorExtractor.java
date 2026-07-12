package com.macmarket.catalog.infrastructure.external;

import java.awt.image.BufferedImage;
import java.net.URI;
import java.net.URLConnection;

import com.macmarket.catalog.domain.model.BackgroundColor;
import com.macmarket.catalog.domain.service.ImageBackgroundColorExtractor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;

@Component
public class AwtImageBackgroundColorExtractor implements ImageBackgroundColorExtractor {

    private static final Logger log = LoggerFactory.getLogger(AwtImageBackgroundColorExtractor.class);

    private static final int CONNECT_TIMEOUT_MS = 3000;
    private static final int READ_TIMEOUT_MS = 5000;
    private static final double CORNER_INSET_RATIO = 0.05;

    @Override
    public BackgroundColor extract(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return BackgroundColor.DEFAULT;
        }

        try {
            var image = downloadImage(imageUrl);
            return sampleCornerColor(image);
        } catch (Exception e) {
            log.warn("Impossible d'extraire la couleur de fond de l'image {} : {}", imageUrl, e.getMessage());
            return BackgroundColor.DEFAULT;
        }
    }

    private BufferedImage downloadImage(String imageUrl) throws Exception {
        URLConnection connection = URI.create(imageUrl).toURL().openConnection();
        connection.setConnectTimeout(CONNECT_TIMEOUT_MS);
        connection.setReadTimeout(READ_TIMEOUT_MS);
        connection.setRequestProperty("User-Agent", "macmarket-catalog-image-sampler");

        try (var stream = connection.getInputStream()) {
            var image = ImageIO.read(stream);
            if (image == null) {
                throw new IllegalStateException("Format d'image non reconnu");
            }
            return image;
        }
    }

    private BackgroundColor sampleCornerColor(BufferedImage image) {
        int width = image.getWidth();
        int height = image.getHeight();
        int insetX = Math.max(1, (int) (width * CORNER_INSET_RATIO));
        int insetY = Math.max(1, (int) (height * CORNER_INSET_RATIO));

        int[][] corners = {
            { insetX, insetY },
            { width - 1 - insetX, insetY },
            { insetX, height - 1 - insetY },
            { width - 1 - insetX, height - 1 - insetY },
        };

        long red = 0;
        long green = 0;
        long blue = 0;
        for (int[] corner : corners) {
            int rgb = image.getRGB(corner[0], corner[1]);
            red += (rgb >> 16) & 0xFF;
            green += (rgb >> 8) & 0xFF;
            blue += rgb & 0xFF;
        }

        int count = corners.length;
        return BackgroundColor.of(toHex((int) (red / count), (int) (green / count), (int) (blue / count)));
    }

    private String toHex(int red, int green, int blue) {
        return String.format("#%02X%02X%02X", red, green, blue);
    }
}
