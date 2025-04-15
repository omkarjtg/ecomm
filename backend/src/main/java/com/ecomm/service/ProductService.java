package com.ecomm.service;

import com.ecomm.model.Product;
import com.ecomm.repo.ProductRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private GeminiService geminiService;

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(Long id) {
        return productRepo.findById(id).orElseThrow(() -> new RuntimeException("no such product"));
    }

    public Product addOrUpdateProduct(Product product, MultipartFile image) throws IOException {
        product.setImageName(image.getOriginalFilename());
        product.setImageType(image.getContentType());
        product.setImageData(image.getBytes());

        // Truncate existing description if it exceeds 1000 characters
        if (product.getDescription() != null && product.getDescription().length() > 1000) {
            logger.warn("Truncating existing description for product {} (length: {}): {}",
                    product.getName(), product.getDescription().length(), product.getDescription());
            product.setDescription(product.getDescription().substring(0, 1000));
        }

        // Generate description if not already set
        if (product.getDescription() == null || product.getDescription().isEmpty()) {
            String description = generateProductDescription(product).block(); // Blocking call for simplicity
            // Truncate the generated description if necessary
            if (description != null && description.length() > 1000) {
                logger.warn("Truncated generated description for product {} (length: {}) to 1000 characters: {}",
                        product.getName(), description.length(), description);
                description = description.substring(0, 1000);
            }
            product.setDescription(description);
        }

        return productRepo.save(product);
    }

    public Mono<String> generateProductDescription(Product product) {
        // Craft a prompt based on product attributes
        String prompt = String.format(
                "Write a short, engaging product description (50-100 words) for the following product:\n" +
                        "Name: %s\n" +
                        "Category: %s\n" +
                        "Price: $%.2f\n" +
                        "The description should highlight the product's features, appeal to customers, and be suitable for an e-commerce website.",
                product.getName(), product.getCategory(), product.getPrice()
        );

        // Add rate limiting to stay within 15 RPM (1 request every 4 seconds)
        return Mono.just(prompt)
                .delayElement(Duration.ofSeconds(4)) // 15 RPM = 1 request every 4 seconds
                .flatMap(geminiService::generateContent)
                .map(rawResponse -> {
                    // Parse the raw JSON response and extract the description text
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode rootNode = mapper.readTree(rawResponse);
                        String description = rootNode.path("candidates")
                                .path(0)
                                .path("content")
                                .path("parts")
                                .path(0)
                                .path("text")
                                .asText();
                        if (description == null || description.trim().isEmpty()) {
                            throw new IllegalStateException("Generated description is empty");
                        }
                        return description;
                    } catch (Exception e) {
                        logger.error("Failed to parse description from GeminiService response: {}", rawResponse, e);
                        throw new IllegalStateException("Failed to parse description: " + e.getMessage());
                    }
                })
                .onErrorResume(e -> {
                    logger.error("Failed to generate description for product {}: {}", product.getName(), e.getMessage());
                    return Mono.just("Description not available due to an error.");
                });
    }

    public Product generateDescriptionForProduct(Long productId) {
        Product product = getProductById(productId);
        if (product == null) {
            throw new IllegalArgumentException("Product not found");
        }

        String description = generateProductDescription(product).block();
        // Truncate the description if necessary
        if (description != null && description.length() > 1000) {
            logger.warn("Truncated generated description for product {} (length: {}) to 1000 characters: {}",
                    product.getName(), description.length(), description);
            description = description.substring(0, 1000);
        }
        product.setDescription(description);

        // Log the final description being saved
        logger.info("Saving product {} with description (length: {}): {}",
                product.getName(), product.getDescription().length(), product.getDescription());

        return productRepo.save(product);
    }

    public void decrementStock(Long productId, int quantity) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Not enough stock available");
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepo.save(product);
    }

    public byte[] getProductImage(Long productId) {
        Product product = getProductById(productId);
        return (product != null) ? product.getImageData() : null;
    }

    public void deleteProduct(Long productId) {
        productRepo.delete(getProductById(productId));
    }

    public List<Product> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }
}