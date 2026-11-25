var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function item(overrides) {
  return Object.assign({ id: 1, name: 'Rice', sku: 'RICE', hsn: '1006', price: 100, qty: 1 }, overrides);
}

test('empty invoice has zero totals', function () {
  assert.deepEqual(invoice.computeInvoiceFigures({ items: [] }), {
    subtotal: 0, discount: 0, tax: 0, cgst: 0, sgst: 0, total: 0, rows: []
  });
});

test('invoice uses HSN GST rate', function () {
  var items = [item()];
  var result = invoice.computeInvoiceFigures({ items: items });
  assert.equal(result.tax, 5);
  assert.equal(result.total, 105);
  assert.equal(result.rows[0].gstPercent, 5);
  assert.equal(pricing.computeTotals(items, '').total, 105);
});

test('invoice splits rounded GST' , function () {
  var result = invoice.computeInvoiceFigures({ items: [item({ price: 0.1, gstRate: 5 })] });
  assert.equal(result.tax, 0.01);
  assert.equal(result.cgst, 0.01);
  assert.equal(result.sgst, 0);
  assert.equal(result.rows[0].gstPercent, 5);
});

test('invoice honors zero GST rate', function () {
  var result = invoice.computeInvoiceFigures({ items: [item({ gstRate: 0 })] });
  assert.equal(result.tax, 0);
});

test('percentage coupon uses cap before tax', function () {
  var items = [item({ price: 2000 })];
  var result = invoice.computeInvoiceFigures({ items: items, coupon: 'SAVE10' });
  assert.equal(result.discount, 150);
  assert.equal(result.total, 1942.5);
  assert.equal(pricing.computeTotals(items, 'SAVE10').total, 1942.5);
});

test('flat coupon respects minimum order', function () {
  var result = invoice.computeInvoiceFigures({ items: [item()], coupon: 'FLAT50' });
  assert.equal(result.discount, 0);
  assert.equal(result.total, 105);
});

test('inactive coupons are not applied', function () {
  var result = invoice.computeInvoiceFigures({ items: [item({ price: 1000 })], coupon: 'DIWALI20' });
  assert.equal(result.discount, 0);
  assert.equal(result.total, 1050);
});

test('render shows a reconciliation notice when invoice and ledger differ', function () {
  var html = invoice.render({ id: 7, date: '2026-01-01', items: [item()], total: 118 });
  assert.match(html, /Accountant Reconciliation Notice/);
  assert.match(html, /-₹13\.00/);
});

test('render omits reconciliation notice when totals match and escapes customer name', function () {
  var html = invoice.render({ id: 8, date: '2026-01-01', customer: '<Shop>', items: [item()], total: 105 });
  assert.doesNotMatch(html, /Accountant Reconciliation Notice/);
  assert.match(html, /&lt;Shop&gt;/);
});

test('invoice totals and GST match the customer order', function () {
  var items = [item({ price: 1000 }), item({ id: 2, name: 'Ghee', hsn: '0405', price: 500 })];
  var billed = pricing.computeTotals(items, 'SAVE10');
  var result = invoice.computeInvoiceFigures({ items: items, coupon: 'SAVE10' });
  assert.equal(result.discount, billed.discount);
  assert.equal(result.tax, billed.tax);
  assert.equal(result.cgst, billed.cgst);
  assert.equal(result.sgst, billed.sgst);
  assert.equal(result.total, billed.total);
});
