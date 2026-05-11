import express from 'express';
import { getContacts, sendMessage, getMessages, getActiveChats, deleteChat } from '../controllers/messages.controller.js';
import { updateUserProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../controllers/auth.middleware.js';

const router = express.Router();

router.get('/contacts', verifyToken, getContacts);
router.get('/active-chats', verifyToken, getActiveChats);
router.get('/:contactId', verifyToken, getMessages);
router.post('/chat', verifyToken, sendMessage);
router.delete('/:contactId', verifyToken, deleteChat);
router.put('/profile', verifyToken, updateUserProfile);
//router.post('/login', loginUser);

export default router;