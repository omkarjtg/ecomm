import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import "../styles/CheckoutPopup.css"
import PropTypes from 'prop-types';

const CheckoutPopup = ({
  show = false,
  handleClose = () => {},
  cartItems = [],
  totalPrice = 0,
  handleCheckout = () => {},
  loading = false,
}) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Checkout</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="checkout-items">
          {Array.isArray(cartItems) && cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="checkout-item d-flex mb-3 align-items-start"
                >
                  <img
                    src={item.imageUrl || '/placeholder-image.png'}
                    alt={item.name || 'Product image'}
                    className="cart-item-image"
                    style={{ width: '120px', height: 'auto', marginRight: '15px' }}
                  />
                  <div>
                    <p className="mb-1 fw-bold">{item.name || 'Product'}</p>
                    <p className="mb-1">Quantity: {item.quantity || 0}</p>
                    <p className="mb-0">
                      Price: ₹{parseFloat((item.price || 0) * (item.quantity || 0))}
                    </p>
                  </div>
                </div>
              ))}
              <hr />
              <h5 className="text-center fw-bold">
                Total: ₹{parseFloat(totalPrice)}
              </h5>
            </>
          ) : (
            <p className="text-center">Your cart is empty</p>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleCheckout}
          disabled={!Array.isArray(cartItems) || cartItems.length === 0 || loading}
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

CheckoutPopup.propTypes = {
  show: PropTypes.bool,
  handleClose: PropTypes.func,
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      price: PropTypes.number,
      quantity: PropTypes.number,
      imageUrl: PropTypes.string,
    })
  ),
  totalPrice: PropTypes.number,
  handleCheckout: PropTypes.func,
  loading: PropTypes.bool,
};

export default CheckoutPopup; 