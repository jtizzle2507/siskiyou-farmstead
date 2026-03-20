import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const { action, data } = await request.json();

  if (!action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 });
  }

  try {
    let result;

    switch (action) {
      // ==================== PRODUCTS ====================
      case 'addProduct': {
        const { data: res, error } = await supabase.from('farm_products').insert({
          name: data.name, category: data.category, size: data.size,
          price: data.price, inventory: data.inventory, active: data.active,
          image_url: data.image_url || null,
        }).select();
        if (error) throw error;
        result = res;
        break;
      }
      case 'updateProduct': {
        const { id, ...updates } = data;
        const { data: res, error } = await supabase.from('farm_products')
          .update(updates).eq('id', id).select();
        if (error) throw error;
        result = res;
        break;
      }
      case 'deleteProduct': {
        const { error } = await supabase.from('farm_products').delete().eq('id', data.id);
        if (error) throw error;
        result = {};
        break;
      }

      // ==================== DELIVERY ZONES ====================
      case 'addZone': {
        const { data: res, error } = await supabase.from('farm_delivery_zones')
          .upsert({ key: data.key, name: data.name, day: data.day, fee: data.fee }).select();
        if (error) throw error;
        result = res;
        break;
      }
      case 'updateZone': {
        const { key, ...updates } = data;
        const { data: res, error } = await supabase.from('farm_delivery_zones')
          .update(updates).eq('key', key).select();
        if (error) throw error;
        result = res;
        break;
      }
      case 'deleteZone': {
        const { error } = await supabase.from('farm_delivery_zones').delete().eq('key', data.key);
        if (error) throw error;
        result = {};
        break;
      }

      // ==================== DELIVERY INFO CARDS ====================
      case 'addInfoCard': {
        const { data: res, error } = await supabase.from('farm_delivery_info').insert({
          icon: data.icon, title: data.title, description: data.description,
          sort_order: data.sort_order || 0,
        }).select();
        if (error) throw error;
        result = res;
        break;
      }
      case 'updateInfoCard': {
        const { id, ...updates } = data;
        const { data: res, error } = await supabase.from('farm_delivery_info')
          .update(updates).eq('id', id).select();
        if (error) throw error;
        result = res;
        break;
      }
      case 'deleteInfoCard': {
        const { error } = await supabase.from('farm_delivery_info').delete().eq('id', data.id);
        if (error) throw error;
        result = {};
        break;
      }

      // ==================== ORDERS ====================
      case 'addOrder': {
        const { data: orderResult, error: orderError } = await supabase.from('farm_orders').insert({
          order_number: data.order_number, customer_name: data.customer_name,
          customer_email: data.customer_email, customer_phone: data.customer_phone,
          customer_address: data.customer_address, delivery_zone: data.delivery_zone,
          delivery_day: data.delivery_day, payment_method: data.payment_method,
          subtotal: data.subtotal, delivery_fee: data.delivery_fee,
          total: data.total, status: 'pending',
        }).select();
        if (orderError) throw orderError;
        const orderId = orderResult[0].id;

        if (data.items && data.items.length > 0) {
          const items = data.items.map((item: Record<string, unknown>) => ({
            order_id: orderId, product_id: item.product_id,
            product_name: item.product_name, product_size: item.product_size,
            price: item.price, quantity: item.quantity,
          }));
          const { error: itemsError } = await supabase.from('farm_order_items').insert(items);
          if (itemsError) throw itemsError;
        }
        result = orderResult;
        break;
      }
      case 'updateOrderStatus': {
        const { data: res, error } = await supabase.from('farm_orders')
          .update({ status: data.status }).eq('id', data.id).select();
        if (error) throw error;
        result = res;
        break;
      }

      // ==================== INVENTORY ====================
      case 'decrementInventory': {
        const { data: current, error: fetchErr } = await supabase.from('farm_products')
          .select('inventory').eq('id', data.id).single();
        if (fetchErr) throw fetchErr;
        const newInventory = Math.max(0, current.inventory - data.quantity);
        const { data: res, error } = await supabase.from('farm_products')
          .update({ inventory: newInventory }).eq('id', data.id).select();
        if (error) throw error;
        result = res;
        break;
      }

      // ==================== ADMIN USERS ====================
      case 'addUser': {
        const { data: res, error } = await supabase.from('farm_admin_users').insert({
          username: data.username, password_hash: data.password, role: data.role,
        }).select();
        if (error) throw error;
        result = res;
        break;
      }
      case 'deleteUser': {
        const { error } = await supabase.from('farm_admin_users').delete().eq('id', data.id);
        if (error) throw error;
        result = {};
        break;
      }
      case 'loginUser': {
        const { data: users, error } = await supabase.from('farm_admin_users')
          .select('id, username, role')
          .eq('username', data.username)
          .eq('password_hash', data.password);
        if (error) throw error;
        if (users && users.length > 0) {
          result = users[0];
        } else {
          return NextResponse.json({ error: 'Invalid credentials', found: false }, { status: 401 });
        }
        break;
      }
      case 'getUsers': {
        const { data: res, error } = await supabase.from('farm_admin_users')
          .select('id, username, role, created_at').order('created_at', { ascending: true });
        if (error) throw error;
        result = res;
        break;
      }

      // ==================== SUBSCRIBERS ====================
      case 'getSubscribers': {
        const { data: res, error } = await supabase.from('farm_subscribers')
          .select('id, email, subscribed_at, active').order('subscribed_at', { ascending: false });
        if (error) throw error;
        result = res;
        break;
      }
      case 'addSubscriber': {
        const { data: res, error } = await supabase.from('farm_subscribers')
          .upsert({ email: data.email, active: true }).select();
        if (error) throw error;
        result = res;
        break;
      }
      case 'deleteSubscriber': {
        const { error } = await supabase.from('farm_subscribers').delete().eq('id', data.id);
        if (error) throw error;
        result = {};
        break;
      }
      case 'toggleSubscriber': {
        const { data: res, error } = await supabase.from('farm_subscribers')
          .update({ active: data.active }).eq('id', data.id).select();
        if (error) throw error;
        result = res;
        break;
      }

      // ==================== BLOG ====================
      case 'getBlogPosts': {
        const { data: res, error } = await supabase.from('farm_blog_posts')
          .select('*').order('created_at', { ascending: false });
        if (error) throw error;
        result = res;
        break;
      }
      case 'addBlogPost': {
        const { data: res, error } = await supabase.from('farm_blog_posts').insert({
          title: data.title, slug: data.slug, content: data.content,
          excerpt: data.excerpt || null, image_url: data.image_url || null,
          image_position: data.image_position || null,
          published: data.published || false,
          published_at: data.published ? new Date().toISOString() : null,
        }).select();
        if (error) throw error;
        result = res;
        break;
      }
      case 'updateBlogPost': {
        const { id, ...updates } = data;
        if (updates.published && !updates.published_at) {
          updates.published_at = new Date().toISOString();
        }
        updates.updated_at = new Date().toISOString();
        const { data: res, error } = await supabase.from('farm_blog_posts')
          .update(updates).eq('id', id).select();
        if (error) throw error;
        result = res;
        break;
      }
      case 'deleteBlogPost': {
        const { error } = await supabase.from('farm_blog_posts').delete().eq('id', data.id);
        if (error) throw error;
        result = {};
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Admin API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
