import { isSupabaseConfigured, supabaseClient } from './supabaseClient.js';

export class AuthService {
  static isConfigured() {
    return isSupabaseConfigured;
  }

  static async getSession() {
    if (!supabaseClient) return null;

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      throw error;
    }

    return data.session;
  }

  static async signIn(email, password) {
    if (!supabaseClient) {
      throw new Error('Supabase authentication is not configured for this deployment.');
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data.session;
  }

  static async signOut() {
    if (!supabaseClient) return;

    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      throw error;
    }
  }

  static onAuthStateChange(callback) {
    if (!supabaseClient) {
      return { unsubscribe: () => {} };
    }

    const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return data.subscription;
  }
}
