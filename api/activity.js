import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getRpcParam = (param) => (param === "Any" || !param ? null : param);

export default async function handler(req, res) {
    console.log('[DIPY API] Request received. Method:', req.method); // Log request start
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Content-Type application/json moved inside try block for success response

    if (req.method === 'OPTIONS') {
        console.log('[DIPY API] Handling OPTIONS request.');
        res.status(200).end();
        return;
    }

    console.log('[DIPY API] Processing GET request. Query:', req.query);

    try {
        const { location, participants, environment, price, exertion } = req.query;

        const rpcParams = {
            filter_location: getRpcParam(location),
            filter_environment: getRpcParam(environment),
            filter_participants_str: getRpcParam(participants),
            filter_price: getRpcParam(price),
            filter_exertion: getRpcParam(exertion),
        };
        console.log('[DIPY API] Calling RPC with params:', JSON.stringify(rpcParams, null, 2));

        const { data, error } = await supabase.rpc('get_random_filtered_activity', rpcParams);

        if (error) {
            console.error('[DIPY API] Supabase RPC Error:', JSON.stringify(error, null, 2)); // Log the full error object
            res.setHeader('Content-Type', 'application/json');
            res.status(500).json({ message: 'Internal server error from RPC', details: error.message, code: error.code, hint: error.hint });
            return;
        }

        console.log('[DIPY API] RPC call successful. Data length:', data ? data.length : 'null');

        if (!data || data.length === 0) {
            console.log('[DIPY API] No activities found for filters.');
            res.setHeader('Content-Type', 'application/json');
            res.status(404).json({ message: 'No activities found...' });
            return;
        }

        const activity = data[0];
        // ... (tag assembly logic remains the same) ...
        const tags = [];
        if (activity.location_tag) tags.push(activity.location_tag === 'Anywhere' ? 'Works Anywhere' : activity.location_tag);
        if (activity.environment_tag) tags.push(activity.environment_tag.charAt(0).toUpperCase() + activity.environment_tag.slice(1));
        if (activity.price_tier) {
            let priceText = activity.price_tier.charAt(0).toUpperCase() + activity.price_tier.slice(1);
            if (activity.price_tier === 'free') priceText = 'Free';
            else if (activity.price_tier === 'low') priceText = 'Low Cost';
            else if (activity.price_tier === 'medium') priceText = 'Medium Cost';
            else if (activity.price_tier === 'high') priceText = 'High Cost';
            tags.push(priceText);
        }
        if (activity.exertion_level) tags.push(`${activity.exertion_level.charAt(0).toUpperCase() + activity.exertion_level.slice(1)} Exertion`);
        if (activity.min_participants) {
            if (activity.max_participants) {
                if (activity.min_participants === activity.max_participants) tags.push(`${activity.min_participants} Person${activity.min_participants > 1 ? 's' : ''}`);
                else tags.push(`${activity.min_participants}-${activity.max_participants} People`);
            } else tags.push(`${activity.min_participants}+ People`);
        }
        // ... (end tag assembly) ...

        console.log('[DIPY API] Successfully found activity:', activity.title);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            image_url: activity.image_url,
            tags: tags
        });

    } catch (err) {
        console.error('[DIPY API] Unexpected error in handler:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2)); // Log full error object
        res.setHeader('Content-Type', 'application/json'); // Ensure JSON for error responses too
        res.status(500).json({ message: 'Internal server error caught in handler', details: err.message, stack: err.stack });
    }
}