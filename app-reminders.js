// 提醒事项相关功能
Object.assign(healthApp, {
    // 渲染提醒事项
    renderReminders() {
        const remindersList = document.getElementById('reminder-list');
        remindersList.innerHTML = '';
        
        // 获取筛选条件
        const memberFilter = document.getElementById('reminder-member-filter').value;
        const typeFilter = document.getElementById('reminder-type-filter').value;
        
        // 筛选提醒
        let filteredReminders = [...this.reminders];
        
        if (memberFilter !== 'all') {
            filteredReminders = filteredReminders.filter(reminder => reminder.memberId === memberFilter);
        }
        
        if (typeFilter !== 'all') {
            filteredReminders = filteredReminders.filter(reminder => reminder.type === typeFilter);
        }
        
        // 按日期排序（最近的在前）
        filteredReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        if (filteredReminders.length === 0) {
            const p = document.createElement('p');
            p.textContent = '暂无提醒事项，请添加';
            p.className = 'placeholder-text';
            remindersList.appendChild(p);
            return;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        filteredReminders.forEach(reminder => {
            const member = this.familyMembers.find(m => m.id === reminder.memberId);
            const dueDate = new Date(reminder.dueDate);
            const isPastDue = dueDate < today && !reminder.completed;
            
            const listItem = document.createElement('div');
            listItem.className = `list-item ${isPastDue ? 'past-due' : ''} ${reminder.completed ? 'completed' : ''}`;
            
            const info = document.createElement('div');
            info.className = 'list-item-info';
            
            const title = document.createElement('h4');
            title.textContent = `${reminder.title} - ${member ? member.name : '未知成员'}`;
            
            const date = document.createElement('p');
            date.textContent = `日期: ${dueDate.toLocaleDateString()}`;
            if (isPastDue) {
                date.innerHTML += ' <span class="overdue">已逾期</span>';
            }
            
            const details = document.createElement('p');
            details.textContent = reminder.description;
            
            info.appendChild(title);
            info.appendChild(date);
            info.appendChild(details);
            
            const actions = document.createElement('div');
            actions.className = 'list-item-actions';
            
            const completeBtn = document.createElement('button');
            completeBtn.textContent = reminder.completed ? '标记未完成' : '标记完成';
            completeBtn.className = reminder.completed ? 'uncomplete' : 'complete';
            completeBtn.addEventListener('click', () => this.toggleReminderComplete(reminder.id));
            
            const editBtn = document.createElement('button');
            editBtn.textContent = '编辑';
            editBtn.addEventListener('click', () => this.editReminder(reminder.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.className = 'delete';
            deleteBtn.addEventListener('click', () => this.deleteReminder(reminder.id));
            
            actions.appendChild(completeBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            listItem.appendChild(info);
            listItem.appendChild(actions);
            
            remindersList.appendChild(listItem);
        });
    },
    
    // 显示添加提醒事项模态框
    showAddReminderModal(reminderId = null) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const reminder = reminderId ? this.reminders.find(r => r.id === reminderId) : null;
        
        modalBody.innerHTML = `
            <h3>${reminder ? '编辑' : '添加'}提醒事项</h3>
            <form id="reminder-form">
                <div class="form-group">
                    <label for="reminder-member">家庭成员</label>
                    <select id="reminder-member" required>
                        <option value="">请选择家庭成员</option>
                        ${this.familyMembers.map(member => 
                            `<option value="${member.id}" ${reminder && reminder.memberId === member.id ? 'selected' : ''}>${member.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="reminder-title">标题</label>
                    <input type="text" id="reminder-title" value="${reminder ? reminder.title : ''}" required>
                </div>
                <div class="form-group">
                    <label for="reminder-type">提醒类型</label>
                    <select id="reminder-type" required>
                        <option value="checkup" ${reminder && reminder.type === 'checkup' ? 'selected' : ''}>体检提醒</option>
                        <option value="medication" ${reminder && reminder.type === 'medication' ? 'selected' : ''}>服药提醒</option>
                        <option value="other" ${reminder && reminder.type === 'other' ? 'selected' : ''}>其他提醒</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="reminder-date">日期</label>
                    <input type="date" id="reminder-date" value="${reminder ? reminder.dueDate : new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label for="reminder-description">描述</label>
                    <textarea id="reminder-description">${reminder ? reminder.description : ''}</textarea>
                </div>
                <div class="form-buttons">
                    <button type="button" class="cancel">取消</button>
                    <button type="submit" class="submit">${reminder ? '保存' : '添加'}</button>
                </div>
            </form>
        `;
        
        modal.style.display = 'block';
        
        // 表单提交事件
        document.getElementById('reminder-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                memberId: document.getElementById('reminder-member').value,
                title: document.getElementById('reminder-title').value,
                type: document.getElementById('reminder-type').value,
                dueDate: document.getElementById('reminder-date').value,
                description: document.getElementById('reminder-description').value
            };
            
            if (reminder) {
                // 编辑现有提醒
                this.updateReminder(reminderId, formData);
            } else {
                // 添加新提醒
                this.addReminder(formData);
            }
            
            this.closeModal();
        });
        
        // 取消按钮事件
        document.querySelector('.form-buttons .cancel').addEventListener('click', () => this.closeModal());
    },
    
    // 添加提醒事项
    addReminder(data) {
        const newReminder = {
            id: Date.now().toString(),
            ...data,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.reminders.push(newReminder);
        this.saveData();
        this.renderReminders();
        this.renderDashboard();
    },
    
    // 更新提醒事项
    updateReminder(id, data) {
        const index = this.reminders.findIndex(r => r.id === id);
        if (index !== -1) {
            this.reminders[index] = { 
                ...this.reminders[index], 
                ...data,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            this.renderReminders();
            this.renderDashboard();
        }
    },
    
    // 切换提醒事项完成状态
    toggleReminderComplete(id) {
        const index = this.reminders.findIndex(r => r.id === id);
        if (index !== -1) {
            this.reminders[index].completed = !this.reminders[index].completed;
            this.reminders[index].completedAt = this.reminders[index].completed ? new Date().toISOString() : null;
            this.saveData();
            this.renderReminders();
            this.renderDashboard();
        }
    },
    
    // 编辑提醒事项
    editReminder(id) {
        this.showAddReminderModal(id);
    },
    
    // 删除提醒事项
    deleteReminder(id) {
        if (confirm('确定要删除这条提醒事项吗？')) {
            this.reminders = this.reminders.filter(r => r.id !== id);
            this.saveData();
            this.renderReminders();
            this.renderDashboard();
        }
    },
    
    // 检查今日提醒
    checkTodayReminders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayReminders = this.reminders.filter(reminder => {
            const dueDate = new Date(reminder.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime() && !reminder.completed;
        });
        
        if (todayReminders.length > 0) {
            const message = `今天有 ${todayReminders.length} 项提醒需要处理`;
            alert(message);
        }
    }
});