import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to process query parameters
const getRpcParam = (param) => (param === "Any" || !param ? null : param);

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Extract and process query parameters
        const { location, participants, environment, price, exertion } = req.query;

        // Prepare parameters for RPC call
        const rpcParams = {
            filter_location: getRpcParam(location),
            filter_environment: getRpcParam(environment),
            filter_participants_str: getRpcParam(participants),
            filter_price: getRpcParam(price),
            filter_exertion: getRpcParam(exertion),
        };

        // Call the RPC function
        const { data, error } = await supabase.rpc('get_random_filtered_activity', rpcParams);

        // Handle RPC errors
        if (error) {
            res.status(500).json({ message: 'Internal server error', details: error.message });
            return;
        }

        // Handle no results found
        if (!data || data.length === 0) {
            res.status(404).json({ message: 'No activities found...' });
            return;
        }

        // Process the activity data
        const activity = data[0];
        const tags = [];

        // Location tag
        if (activity.location_tag) {
            tags.push(activity.location_tag === 'Anywhere' ? 'Works Anywhere' : activity.location_tag);
        }

        // Environment tag
        if (activity.environment_tag) {
            tags.push(activity.environment_tag.charAt(0).toUpperCase() + activity.environment_tag.slice(1));
        }

        // Price tier tag
        if (activity.price_tier) {
            let priceText = activity.price_tier.charAt(0).toUpperCase() + activity.price_tier.slice(1);
            if (activity.price_tier === 'free') {
                priceText = 'Free';
            } else if (activity.price_tier === 'low') {
                priceText = 'Low Cost';
            } else if (activity.price_tier === 'medium') {
                priceText = 'Medium Cost';
            } else if (activity.price_tier === 'high') {
                priceText = 'High Cost';
            }
            tags.push(priceText);
        }

        // Exertion level tag
        if (activity.exertion_level) {
            tags.push(`${activity.exertion_level.charAt(0).toUpperCase() + activity.exertion_level.slice(1)} Exertion`);
        }

        // Participants tag
        if (activity.min_participants) {
            if (activity.max_participants) {
                if (activity.min_participants === activity.max_participants) {
                    tags.push(`${activity.min_participants} Person${activity.min_participants > 1 ? 's' : ''}`);
                } else {
                    tags.push(`${activity.min_participants}-${activity.max_participants} People`);
                }
            } else {
                tags.push(`${activity.min_participants}+ People`);
            }
        }

        // Send successful response
        res.status(200).json({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            image_url: activity.image_url,
            tags: tags
        });

    } catch (err) {
        // Handle unexpected errors
        console.error('Unexpected error:', err);
        res.status(500).json({ message: 'Internal server error', details: err.message });
    }
} 