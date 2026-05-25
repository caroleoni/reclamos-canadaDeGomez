import { supabase } from '../lib/supabaseClient';

export async function signInAdmin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        throw new Error(error.message)
    }
    return data;
};

// Protects admin access and lets the dashboard validate the current session.
export async function getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw error
    }
    return data.session;
};

export async function signOutAdmin() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
};
