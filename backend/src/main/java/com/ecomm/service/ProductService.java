package com.ecomm.service;

import com.ecomm.model.Product;
import com.ecomm.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepo productRepo;

    public List<Product> getAllProducts(){
       return productRepo.findAll();
    }

    public Product getProductById(int id) {
        return productRepo.findById(id);
    }


    public Product addOrUpdateProduct(Product product, MultipartFile image) throws IOException {
        product.setImageName(image.getOriginalFilename());
        product.setImageType(image.getContentType());
        product.setImageData(image.getBytes());

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

    public byte[] getProductImage(int productId) {
        Product product = getProductById(productId);
        return (product != null) ? product.getImageData() : null;
    }

    public void deleteProduct(int id) {
        productRepo.delete(getProductById(id));
    }

    public List<Product> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }
}
