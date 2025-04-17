import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CartItem = ({ item, onQuantityChange, onRemove, disabled }) => {
    const handleIncrease = () => {
        if (item.quantity < item.stockQuantity) {
            onQuantityChange(item.id, item.quantity + 1);
        } else {
            toast.info(`Only ${item.stockQuantity} available in stock`);
        }
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            onQuantityChange(item.id, item.quantity - 1);
        }
    };

    return (
        <div className={`cart-item ${item.quantity > item.stockQuantity ? 'out-of-stock' : ''}`}>
            <div className="item-image">
                <img src={item.imageUrl} alt={item.name} className="img-fluid" />
                {item.quantity > item.stockQuantity && (
                    <Badge bg="danger" className="stock-badge">
                        Only {item.stockQuantity} left
                    </Badge>
                )}
            </div>

            <div className="item-info">
                <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-price">₹{item.price.toFixed(2)}</p>
                    {item.discount > 0 && (
                        <p className="item-original-price">
                            <del>₹{(item.price / (1 - item.discount/100)).toFixed(2)}</del>
                            <span className="discount-tag">{item.discount}% OFF</span>
                        </p>
                    )}
                </div>

                <div className="item-actions">
                    <div className="quantity-control">
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleDecrease}
                            disabled={disabled || item.quantity <= 1}
                            aria-label="Decrease quantity"
                            size="sm"
                        >
                            <FiMinus />
                        </Button>
                        <span className="quantity">{item.quantity}</span>
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleIncrease}
                            disabled={disabled || item.quantity >= item.stockQuantity}
                            aria-label="Increase quantity"
                            size="sm"
                        >
                            <FiPlus />
                        </Button>
                    </div>

                    <Button 
                        variant="danger"
                        onClick={() => onRemove(item.id)}
                        disabled={disabled}
                        aria-label="Remove item"
                        size="sm"
                        className="remove-btn"
                    >
                        <FiTrash2 /> Remove
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CartItem;