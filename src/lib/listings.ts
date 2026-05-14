import { supabase } from './supabase';

export type Platform = 'ebay' | 'fb' | 'etsy' | 'shopify';

export interface ListingDraft {
  title: string;
  description: string;
  price: number;
  specs: any;
}

export class ListingService {
  /**
   * Transitions an item from 'identified' to 'listed'
   * Saves the final platform-specific drafts to the item metadata
   */
  static async markAsListed(itemId: string, platform: Platform, draft: ListingDraft) {
    const { data: item, error: fetchError } = await supabase
      .from('inventory')
      .select('metadata')
      .eq('id', itemId)
      .single();

    if (fetchError) throw fetchError;

    const metadata = item.metadata || {};
    const listings = metadata.listings || {};
    
    listings[platform] = {
      ...draft,
      listed_at: new Date().toISOString(),
      status: 'active'
    };

    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        status: 'listed',
        metadata: {
          ...metadata,
          listings
        }
      })
      .eq('id', itemId);

    if (updateError) throw updateError;

    // Log the activity
    await supabase.from('activity_logs').insert({
      event_type: 'item_listed',
      message: `Item ${itemId} listed on ${platform.toUpperCase()}`,
      metadata: { itemId, platform }
    });

    return true;
  }

  /**
   * Fetches the current listing status for an item
   */
  static getListingStatus(item: any, platform: Platform) {
    return item.metadata?.listings?.[platform]?.status || 'none';
  }
}
