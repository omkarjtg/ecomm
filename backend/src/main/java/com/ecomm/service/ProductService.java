package com.ecomm.service;

import com.ecomm.model.Product;
import com.ecomm.repo.ProductRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
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
        return productRepo.findById(id).orElseThrow(()-> new RuntimeException("no such product"));
    }

    public Product addOrUpdateProduct(Product product, MultipartFile image) throws IOException {
        product.setImageName(image.getOriginalFilename());
        product.setImageType(image.getContentType());
        product.setImageData(image.getBytes());

        // Generate description if not already set
        if (product.getDescription() == null || product.getDescription().isEmpty()) {
            String description = generateProductDescription(product).block(); // Blocking call for simplicity
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
        product.setDescription(description);
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

    public void deleteProduct(Long id) {
        productRepo.delete(getProductById(id));
    }

    public List<Product> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }
}