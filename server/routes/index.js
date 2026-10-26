import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import * as cart from '../controllers/cartController.js';
import * as contact from '../controllers/contactController.js';
import * as orders from '../controllers/orderController.js';
import * as services from '../controllers/serviceController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler as h } from '../utils/http.js';

const router = Router();

// Auth
router.post('/auth/register', h(auth.register));
router.post('/auth/login', h(auth.login));
router.post('/auth/logout', h(auth.logout));
router.get('/auth/me', h(auth.me));

// Katalog (publik)
router.get('/services', h(services.listServices));
router.get('/services/:slug', h(services.getService));

// Cart (wajib login)
router.get('/cart', requireAuth, h(cart.getCart));
router.post('/cart', requireAuth, h(cart.addItem));
router.patch('/cart/:id', requireAuth, h(cart.updateItem));
router.delete('/cart/:id', requireAuth, h(cart.removeItem));

// Order & pembayaran (wajib login)
router.get('/payments/methods', requireAuth, h(orders.paymentMethods));
router.get('/orders', requireAuth, h(orders.listOrders));
router.post('/orders', requireAuth, h(orders.checkout));
router.get('/orders/:number', requireAuth, h(orders.getOrder));
router.post('/orders/:number/pay', requireAuth, h(orders.pay));
router.post('/orders/:number/cancel', requireAuth, h(orders.cancel));

// Kontak (publik)
router.post('/contact', h(contact.createMessage));

export default router;
