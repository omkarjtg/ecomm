import React from 'react';

const CartItem = ({ item, onQuantityChange, onRemove, disabled }) => {
    const handleIncrease = () => {
        if (item.quantity < item.stockQuantity) {
            onQuantityChange(item.id, item.quantity + 1);
        } else {
            toast.info(`Cannot add more than available stock (${item.stockQuantity})`);
        }
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            onQuantityChange(item.id, item.quantity - 1);
        }
    };

    return (
        <div className="cart-item">
            <div className="item-image">
                <img src={item.imageUrl} alt={item.name} />
            </div>

            <div className="item-details">
                <h3>{item.name}</h3>
                <p>₹{item.price.toFixed(2)}</p>
                {item.quantity > item.stockQuantity && (
                    <p className="stock-warning">Only {item.stockQuantity} available</p>
                )}
            </div>

            <div className="item-actions">
                <div className="quantity-control">
                    <button
                        onClick={handleDecrease}
                        disabled={disabled || item.quantity <= 1}
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                        onClick={handleIncrease}
                        disabled={disabled || item.quantity >= item.stockQuantity}
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>

                <button
                    className="remove-btn"
                    onClick={() => onRemove(item.id)}
                    disabled={disabled}
                    aria-label="Remove item"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default CartItem;    