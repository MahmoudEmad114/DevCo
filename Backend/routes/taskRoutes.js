const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');

router.use(authController.protect);

// ============ Task Routes ============
router.get('/', taskController.getAllTasks);

router.post('/project/:projectId', taskController.createTask);
router.get('/project/:projectId', taskController.getTasksByProject);

router
    .route('/:id')
    .get(taskController.getTask)
    .patch(taskController.updateTask)
    .delete(taskController.deleteTask);

router.patch('/:id/assign', taskController.assignTask);
router.patch('/:id/status', taskController.changeStatus);
router.patch('/:id/priority', taskController.changePriority);

// ============ Subtask Routes (nested جوه التاسك) ============
router
    .route('/:taskId/subtasks')
    .post(taskController.createSubtask)
    .get(taskController.getSubtasks);

router
    .route('/:taskId/subtasks/:subtaskId')
    .patch(taskController.updateSubtask)
    .delete(taskController.deleteSubtask);

router.patch('/:taskId/subtasks/:subtaskId/complete', taskController.completeSubtask);

module.exports = router;