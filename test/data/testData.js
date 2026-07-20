'use strict';

/**
 * Test data for FashionStack test suite.
 * Centralised here so tests stay DRY and data changes are easy.
 */

module.exports = {
  baseUrl: 'https://ecommercebs.vercel.app',

  // ─── Auth ──────────────────────────────────────────────────────────────────
  validUser: {
    email:    'test@fashionstack.com',
    password: 'Test@1234',
  },
  invalidUser: {
    email:    'invalid@notreal.com',
    password: 'WrongPass999',
  },
  emptyUser: {
    email:    '',
    password: '',
  },
  malformedEmail: {
    email:    'notanemail',
    password: 'Test@1234',
  },

  // ─── Checkout ──────────────────────────────────────────────────────────────
  shippingAddress: {
    firstName: 'Jane',
    lastName:  'Doe',
    address:   '123 Fashion Street',
    city:      'New York',
    zip:       '10001',
    phone:     '5551234567',
  },

  // ─── Search ────────────────────────────────────────────────────────────────
  searchTerms: {
    valid:   'Cotton',
    noMatch: 'xyznonexistentproduct123',
    partial: 'Tee',
  },

  // ─── Products ──────────────────────────────────────────────────────────────
  products: {
    cottonTee:    'Essential Cotton Tee',
    denim:        'Heritage Denim Jacket',
    dress:        'Silk Wrap Dress',
    bag:          'Leather Crossbody Bag',
    jeans:        'Straight Leg Jeans',
    shirt:        'Linen Button Shirt',
  },

  // ─── Newsletter ────────────────────────────────────────────────────────────
  newsletter: {
    validEmail:   'subscriber@test.com',
    invalidEmail: 'notvalid',
  },

  // ─── Nav categories ────────────────────────────────────────────────────────
  navCategories: ['New', 'Men', 'Women', 'Sale', 'Offers'],

  // ─── Page titles ───────────────────────────────────────────────────────────
  pageTitle: 'Ecommerce Clothing Brand Homepage (Community)',
};