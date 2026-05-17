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

//Aca hacemos la proteccion para entrar al Admin, después lo usamos en AdminDashboard.jsx para validar si el admin está logueado.
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