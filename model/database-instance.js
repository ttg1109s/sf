/*
    model/database-instance.js — Singleton MySQL instance shared by the whole app.

    Every module that needs `db` imports it from here instead of instantiating its own,
    so there is exactly one in-memory database for the whole session. Connection is
    established immediately since this "MySQL" is an in-memory stand-in, not a real
    network connection — nothing to await.
*/

import { MySQL } from './database.js';

export const db = new MySQL();
db.connect('localhost', 'root', '', 'test');
