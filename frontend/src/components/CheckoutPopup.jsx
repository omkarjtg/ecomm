import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const CheckoutPopup = ({
  show,
  handleClose,
  cartItems,
  totalPrice,
  handleCheckout,
  loading = false,
}) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Checkout</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="checkout-items">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="checkout-item d-flex mb-3 align-items-start"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="cart-item-image"
                style={{ width: '120px', height: 'auto', marginRight: '15px' }}
              />
              <div>
                <p className="mb-1 fw-bold">{item.name}</p>
                <p className="mb-1">Quantity: {item.quantity}</p>
                <p className="mb-0">
                  Price: ${parseFloat(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          <hr />
          <h5 className="text-center fw-bold">
            Total: ${parseFloat(totalPrice).toFixed(2)}
          </h5>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleCheckout}
          disabled={cartItems.length === 0 || loading}
        >
          {loading ? (
            <>
              <Spinner
                animation="border"
                size="sm"
                className="me-2"
                role="status"
              />
              Processing...
            </>
          ) : (
            'Confirm Purchase'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CheckoutPopup;
