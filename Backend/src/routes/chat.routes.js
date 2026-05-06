import express from 'express';
import { getContacts, sendMessage, getMessages, getActiveChats } from '../controllers/messages.controller.js';
import { verifyToken } from '../controllers/auth.middleware.js';

const router = express.Router();

router.get('/contacts', verifyToken, getContacts);
router.get('/active-chats', verifyToken, getActiveChats);
router.get('/:contactId', verifyToken, getMessages);
router.post('/chat', verifyToken, sendMessage);
//router.post('/login', loginUser);

export default router;