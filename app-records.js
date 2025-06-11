// 健康记录相关功能
Object.assign(healthApp, {
    // 渲染健康记录
    renderHealthRecords() {
        const recordsList = document.getElementById('health-records');
        recordsList.innerHTML = '';
        
        // 获取筛选条件
        const memberFilter = document.getElementById('record-member-filter').value;
        const typeFilter = document.getElementById('record-type-filter').value;
        
        // 筛选记录
        let filteredRecords = [...this.healthRecords];
        
        if (memberFilter !== 'all') {
            filteredRecords = filteredRecords.filter(record => record.memberId === memberFilter);
        }
        
        if (typeFilter !== 'all') {
            filteredRecords = filteredRecords.filter(record => record.type === typeFilter);
        }
        
        // 按日期排序（最新的在前）
        filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredRecords.length === 0) {
            const p = document.createElement('p');
            p.textContent = '暂无健康记录，请添加';
            p.className = 'placeholder-text';
            recordsList.appendChild(p);
            return;
        }
        
        filteredRecords.forEach(record => {
            const member = this.familyMembers.find(m => m.id === record.memberId);
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            
            const info = document.createElement('div');
            info.className = 'list-item-info';
            
            const title = document.createElement('h4');
            title.textContent = `${record.type} - ${member ? member.name : '未知成员'}`;
            
            const date = document.createElement('p');
            date.textContent = `日期: ${new Date(record.date).toLocaleDateString()}`;
            
            const details = document.createElement('p');
            details.textContent = record.description;
            
            info.appendChild(title);
            info.appendChild(date);
            info.appendChild(details);
            
            const actions = document.createElement('div');
            actions.className = 'list-item-actions';
            
            const viewBtn = document.createElement('button');
            viewBtn.textContent = '查看';
            viewBtn.addEventListener('click', () => this.viewHealthRecord(record.id));
            
            const editBtn = document.createElement('button');
            editBtn.textContent = '编辑';
            editBtn.addEventListener('click', () => this.editHealthRecord(record.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.className = 'delete';
            deleteBtn.addEventListener('click', () => this.deleteHealthRecord(record.id));
            
            actions.appendChild(viewBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            listItem.appendChild(info);
            listItem.appendChild(actions);
            
            recordsList.appendChild(listItem);
        });
    },
    
    // 显示添加健康记录模态框
    showAddRecordModal(recordId = null) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const record = recordId ? this.healthRecords.find(r => r.id === recordId) : null;
        
        modalBody.innerHTML = `
            <h3>${record ? '编辑' : '添加'}健康记录</h3>
            <form id="record-form">
                <div class="form-group">
                    <label for="record-member">家庭成员</label>
                    <select id="record-member" required>
                        <option value="">请选择家庭成员</option>
                        ${this.familyMembers.map(member => 
                            `<option value="${member.id}" ${record && record.memberId === member.id ? 'selected' : ''}>${member.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="record-type">记录类型</label>
                    <select id="record-type" required>
                        <option value="checkup" ${record && record.type === 'checkup' ? 'selected' : ''}>体检记录</option>
                        <option value="medication" ${record && record.type === 'medication' ? 'selected' : ''}>用药记录</option>
                        <option value="symptom" ${record && record.type === 'symptom' ? 'selected' : ''}>症状记录</option>
                        <option value="other" ${record && record.type === 'other' ? 'selected' : ''}>其他记录</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="record-date">日期</label>
                    <input type="date" id="record-date" value="${record ? record.date : new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label for="record-description">描述</label>
                    <textarea id="record-description" required>${record ? record.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="record-values">测量值</label>
                    <textarea id="record-values" placeholder="例如：血压 120/80、体重 65kg">${record && record.values ? record.values : ''}</textarea>
                </div>
                <div class="form-buttons">
                    <button type="button" class="cancel">取消</button>
                    <button type="submit" class="submit">${record ? '保存' : '添加'}</button>
                </div>
            </form>
        `;
        
        modal.style.display = 'block';
        
        // 表单提交事件
        document.getElementById('record-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                memberId: document.getElementById('record-member').value,
                type: document.getElementById('record-type').value,
                date: document.getElementById('record-date').value,
                description: document.getElementById('record-description').value,
                values: document.getElementById('record-values').value
            };
            
            if (record) {
                // 编辑现有记录
                this.updateHealthRecord(recordId, formData);
            } else {
                // 添加新记录
                this.addHealthRecord(formData);
            }
            
            this.closeModal();
        });
        
        // 取消按钮事件
        document.querySelector('.form-buttons .cancel').addEventListener('click', () => this.closeModal());
    },
    
    // 添加健康记录
    addHealthRecord(data) {
        const newRecord = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date().toISOString()
        };
        
        this.healthRecords.push(newRecord);
        this.saveData();
        this.renderHealthRecords();
        this.renderDashboard();
    },
    
    // 更新健康记录
    updateHealthRecord(id, data) {
        const index = this.healthRecords.findIndex(r => r.id === id);
        if (index !== -1) {
            this.healthRecords[index] = { 
                ...this.healthRecords[index], 
                ...data,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            this.renderHealthRecords();
            this.renderDashboard();
        }
    },
    
    // 查看健康记录详情
    viewHealthRecord(id) {
        const record = this.healthRecords.find(r => r.id === id);
        if (!record) return;
        
        const member = this.familyMembers.find(m => m.id === record.memberId);
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const recordTypeMap = {
            'checkup': '体检记录',
            'medication': '用药记录',
            'symptom': '症状记录',
            'other': '其他记录'
        };
        
        modalBody.innerHTML = `
            <h3>健康记录详情</h3>
            <div class="record-details">
                <p><strong>家庭成员:</strong> ${member ? member.name : '未知成员'}</p>
                <p><strong>记录类型:</strong> ${recordTypeMap[record.type] || record.type}</p>
                <p><strong>日期:</strong> ${new Date(record.date).toLocaleDateString()}</p>
                <p><strong>描述:</strong> ${record.description}</p>
                ${record.values ? `<p><strong>测量值:</strong> ${record.values}</p>` : ''}
                <p><strong>创建时间:</strong> ${new Date(record.createdAt).toLocaleString()}</p>
                ${record.updatedAt ? `<p><strong>更新时间:</strong> ${new Date(record.updatedAt).toLocaleString()}</p>` : ''}
            </div>
            <div class="form-buttons">
                <button type="button" class="submit">关闭</button>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // 关闭按钮事件
        document.querySelector('.form-buttons .submit').addEventListener('click', () => this.closeModal());
    },
    
    // 编辑健康记录
    editHealthRecord(id) {
        this.showAddRecordModal(id);
    },
    
    // 删除健康记录
    deleteHealthRecord(id) {
        if (confirm('确定要删除这条健康记录吗？')) {
            this.healthRecords = this.healthRecords.filter(r => r.id !== id);
            this.saveData();
            this.renderHealthRecords();
            this.renderDashboard();
        }
    }
});