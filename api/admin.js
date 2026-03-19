const https = require('https');

function supabaseRequest(method, path, body, serviceRoleKey, supabaseUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(supabaseUrl);
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation'
    };

    const req = https.request({
      hostname: url.hostname,
      path: `/rest/v1/${path}`,
      method: method,
      headers: headers
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(responseBody ? JSON.parse(responseBody) : {});
          } catch {
            resolve(responseBody);
          }
        } else {
          reject(new Error(`Supabase API error ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { action, data } = req.body || {};

  if (!action) {
    return res.status(400).json({ error: 'Action is required' });
  }

  try {
    let result;

    switch (action) {
      // ==================== PRODUCTS ====================
      case 'addProduct': {
        result = await supabaseRequest('POST', 'farm_products', {
          name: data.name,
          category: data.category,
          size: data.size,
          price: data.price,
          inventory: data.inventory,
          active: data.active,
          image_url: data.image_url || null
        }, serviceRoleKey, supabaseUrl);
        break;
      }
      case 'updateProduct': {
        const { id, ...updates } = data;
        result = await supabaseRequest(
          'PATCH',
          `farm_products?id=eq.${id}`,
          updates,
          serviceRoleKey, supabaseUrl
        );
        break;
      }
      case 'deleteProduct': {
        result = await supabaseRequest(
          'DELETE',
          `farm_products?id=eq.${data.id}`,
          null,
          serviceRoleKey, supabaseUrl
        );
        break;
      }

      // ==================== DELIVERY ZONES ====================
      case 'addZone': {
        // Use upsert so editing existing zones works too
        result = await supabaseRequest('POST', 'farm_delivery_zones', {
          key: data.key,
          name: data.name,
          day: data.day,
          fee: data.fee
        }, serviceRoleKey, supabaseUrl, { prefer: 'resolution=merge-duplicates,return=representation' });
        break;
      }
      case 'updateZone': {
        const { key, ...updates } = data;
        result = await supabaseRequest(
          'PATCH',
          `farm_delivery_zones?key=eq.${encodeURIComponent(key)}`,
          updates,
          serviceRoleKey, supabaseUrl
        );
        break;
      }
      case 'deleteZone': {
        result = await supabaseRequest(
          'DELETE',
          `farm_delivery_zones?key=eq.${encodeURIComponent(data.key)}`,
          null,
          serviceRoleKey, supabaseUrl
        );
        break;
      }

      // ==================== DELIVERY INFO CARDS ====================
      case 'addInfoCard': {
        result = await supabaseRequest('POST', 'farm_delivery_info', {
          icon: data.icon,
          title: data.title,
          description: data.description,
          sort_order: data.sort_order || 0
        }, serviceRoleKey, supabaseUrl);
        break;
      }
      case 'updateInfoCard': {
        const { id, ...updates } = data;
        result = await supabaseRequest(
          'PATCH',
          `farm_delivery_info?id=eq.${id}`,
          updates,
          serviceRoleKey, supabaseUrl
        );
        break;
      }
      case 'deleteInfoCard': {
        result = await supabaseRequest(
          'DELETE',
          `farm_delivery_info?id=eq.${data.id}`,
          null,
          serviceRoleKey, supabaseUrl
        );
        break;
      }

      // ==================== ORDERS ====================
      case 'addOrder': {
        // Insert order first
        const orderResult = await supabaseRequest('POST', 'farm_orders', {
          order_number: data.order_number,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          delivery_zone: data.delivery_zone,
          delivery_day: data.delivery_day,
          payment_method: data.payment_method,
          subtotal: data.subtotal,
          delivery_fee: data.delivery_fee,
          total: data.total,
          status: 'pending'
        }, serviceRoleKey, supabaseUrl);

        const orderId = Array.isArray(orderResult) ? orderResult[0].id : orderResult.id;

        // Insert order items
        if (data.items && data.items.length > 0) {
          const items = data.items.map(item => ({
            order_id: orderId,
            product_id: item.product_id,
            product_name: item.product_name,
            product_size: item.product_size,
            price: item.price,
            quantity: item.quantity
          }));
          await supabaseRequest('POST', 'farm_order_items', items, serviceRoleKey, supabaseUrl);
        }

        result = orderResult;
        break;
      }
      case 'updateOrderStatus': {
        result = await supabaseRequest(
          'PATCH',
          `farm_orders?id=eq.${data.id}`,
          { status: data.status },
          serviceRoleKey, supabaseUrl
        );
        break;
      }

      // ==================== INVENTORY ====================
      case 'decrementInventory': {
        // Use RPC or manual update
        // First fetch current inventory
        const productUrl = `farm_products?id=eq.${data.id}&select=inventory`;
        // We need GET - supabaseRequest handles this
        const currentProduct = await supabaseRequest('GET', productUrl, null, serviceRoleKey, supabaseUrl);
        if (Array.isArray(currentProduct) && currentProduct.length > 0) {
          const newInventory = Math.max(0, currentProduct[0].inventory - data.quantity);
          result = await supabaseRequest(
            'PATCH',
            `farm_products?id=eq.${data.id}`,
            { inventory: newInventory },
            serviceRoleKey, supabaseUrl
          );
        }
        break;
      }

      // ==================== ADMIN USERS ====================
      case 'addUser': {
        result = await supabaseRequest('POST', 'farm_admin_users', {
          username: data.username,
          password_hash: data.password,
          role: data.role
        }, serviceRoleKey, supabaseUrl);
        break;
      }
      case 'deleteUser': {
        result = await supabaseRequest(
          'DELETE',
          `farm_admin_users?id=eq.${data.id}`,
          null,
          serviceRoleKey, supabaseUrl
        );
        break;
      }
      case 'loginUser': {
        // Query for matching user
        const users = await supabaseRequest(
          'GET',
          `farm_admin_users?username=eq.${encodeURIComponent(data.username)}&password_hash=eq.${encodeURIComponent(data.password)}&select=id,username,role`,
          null,
          serviceRoleKey, supabaseUrl
        );
        if (Array.isArray(users) && users.length > 0) {
          result = users[0];
        } else {
          return res.status(401).json({ error: 'Invalid credentials', found: false });
        }
        break;
      }
      case 'getUsers': {
        result = await supabaseRequest(
          'GET',
          'farm_admin_users?select=id,username,role,created_at&order=created_at.asc',
          null,
          serviceRoleKey, supabaseUrl
        );
        break;
      }

      // ==================== SUBSCRIBERS ====================
      case 'getSubscribers': {
        result = await supabaseRequest(
          'GET',
          'farm_subscribers?select=id,email,subscribed_at,active&order=subscribed_at.desc',
          null,
          serviceRoleKey, supabaseUrl
        );
        break;
      }
      case 'deleteSubscriber': {
        result = await supabaseRequest(
          'DELETE',
          `farm_subscribers?id=eq.${data.id}`,
          null,
          serviceRoleKey, supabaseUrl
        );
        break;
      }
      case 'toggleSubscriber': {
        result = await supabaseRequest(
          'PATCH',
          `farm_subscribers?id=eq.${data.id}`,
          { active: data.active },
          serviceRoleKey, supabaseUrl
        );
        break;
      }

      // ==================== BLOG ====================
      case 'getBlogPosts': {
        result = await supabaseRequest(
          'GET',
          'farm_blog_posts?select=*&order=created_at.desc',
          null,
          serviceRoleKey, supabaseUrl
        );
        break;
      }
      case 'addBlogPost': {
        result = await supabaseRequest('POST', 'farm_blog_posts', {
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || null,
          image_url: data.image_url || null,
          published: data.published || false,
          published_at: data.published ? new Date().toISOString() : null
        }, serviceRoleKey, supabaseUrl);
        break;
      }
      case 'updateBlogPost': {
        const { id, ...updates } = data;
        if (updates.published && !updates.published_at) {
          updates.published_at = new Date().toISOString();
        }
        updates.updated_at = new Date().toISOString();
        result = await supabaseRequest(
          'PATCH',
          `farm_blog_posts?id=eq.${id}`,
          updates,
          serviceRoleKey, supabaseUrl
        );
        break;
      }
      case 'deleteBlogPost': {
        result = await supabaseRequest(
          'DELETE',
          `farm_blog_posts?id=eq.${data.id}`,
          null,
          serviceRoleKey, supabaseUrl
        );
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Admin API error:', error.message);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
