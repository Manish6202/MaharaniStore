# Debugging Admin Orders 500 Error

## Steps to Debug:

1. **Check Backend Server Logs:**
   - Look for error messages in backend console
   - Check if MongoDB is connected
   - Verify admin token is valid

2. **Test API Directly:**
   ```bash
   curl -X GET "http://localhost:5001/api/orders?page=1&limit=20" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

3. **Check Database:**
   - Verify Order collection exists
   - Check if there are any orders
   - Verify User and Product collections exist

4. **Common Issues:**
   - Missing User or Product references in orders
   - Database connection issues
   - Invalid admin token
   - Populate() failing on deleted references

## Fixed Issues:

✅ Added better error handling in getAllOrders
✅ Added null checks for populated fields
✅ Added fallback if populate fails
✅ Improved logging for debugging
✅ Better error messages in admin panel

