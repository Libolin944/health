// 数据模型
const healthApp = {
    familyMembers: [],
    healthRecords: [],
    reminders: [],
    healthPlans: [],
    healthWarnings: [],
    
    // 初始化应用
    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderDashboard();
        this.setupNavigation();
        
        // 初始化健康预警模块
        if (typeof this.initWarningModule === 'function') {
            this.initWarningModule();
        }
        
        // 初始化健康计划模块
        if (typeof this.initHealthPlanModule === 'function') {
            this.initHealthPlanModule();
        }
    },
    
    // 从本地存储加载数据
    loadData() {
        this.familyMembers = JSON.parse(localStorage.getItem('familyMembers')) || [];
        this.healthRecords = JSON.parse(localStorage.getItem('healthRecords')) || [];
        this.reminders = JSON.parse(localStorage.getItem('reminders')) || [];
        this.healthPlans = JSON.parse(localStorage.getItem('healthPlans')) || [];
        this.healthWarnings = JSON.parse(localStorage.getItem('healthWarnings')) || [];
    },
    
    // 保存数据到本地存储
    saveData() {
        localStorage.setItem('familyMembers', JSON.stringify(this.familyMembers));
        localStorage.setItem('healthRecords', JSON.stringify(this.healthRecords));
        localStorage.setItem('reminders', JSON.stringify(this.reminders));
        localStorage.setItem('healthPlans', JSON.stringify(this.healthPlans));
        localStorage.setItem('healthWarnings', JSON.stringify(this.healthWarnings));
    },
    
    // 设置导航事件
    setupNavigation() {
        const navButtons = document.querySelectorAll('nav button');
        const pages = document.querySelectorAll('.page');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.id.replace('nav-', '');
                
                // 更新活动按钮
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // 显示目标页面
                pages.forEach(page => page.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');
                
                // 根据页面加载相应数据
                if (targetId === 'family') {
                    this.renderFamilyMembers();
                } else if (targetId === 'records') {
                    this.renderHealthRecords();
                } else if (targetId === 'reminders') {
                    this.renderReminders();
                } else if (targetId === 'warning') {
                    this.setupWarningOptions();
                    this.renderWarnings();
                } else if (targetId === 'analysis') {
                    this.setupAnalysisOptions();
                } else if (targetId === 'health-plan') {
                    this.setupHealthPlanOptions();
                }
            });
        });
    },
    
    // 导航到指定页面
    navigateTo(targetId) {
        const navButtons = document.querySelectorAll('nav button');
        const pages = document.querySelectorAll('.page');
        
        // 更新活动按钮
        navButtons.forEach(btn => btn.classList.remove('active'));
        const targetButton = document.getElementById(`nav-${targetId}`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
        
        // 显示目标页面
        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(targetId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 根据页面加载相应数据
        if (targetId === 'family') {
            this.renderFamilyMembers();
        } else if (targetId === 'records') {
            this.renderHealthRecords();
        } else if (targetId === 'reminders') {
            this.renderReminders();
        } else if (targetId === 'warning') {
            this.setupWarningOptions();
            this.renderWarnings();
        } else if (targetId === 'analysis') {
            this.setupAnalysisOptions();
        } else if (targetId === 'health-plan') {
            this.setupHealthPlanOptions();
        }
    },
    
    // 设置事件监听器
    setupEventListeners() {
        // 快速操作按钮
        document.getElementById('add-family-btn').addEventListener('click', () => this.showAddFamilyModal());
        document.getElementById('add-record-btn').addEventListener('click', () => this.showAddRecordModal());
        document.getElementById('add-reminder-btn').addEventListener('click', () => this.showAddReminderModal());
        
        // 页面特定按钮
        document.getElementById('add-family-member').addEventListener('click', () => this.showAddFamilyModal());
        document.getElementById('add-health-record').addEventListener('click', () => this.showAddRecordModal());
        document.getElementById('add-reminder').addEventListener('click', () => this.showAddReminderModal());
        
        // 模态框关闭按钮
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        // 筛选器变更事件
        document.getElementById('record-member-filter').addEventListener('change', () => this.renderHealthRecords());
        document.getElementById('record-type-filter').addEventListener('change', () => this.renderHealthRecords());
        document.getElementById('reminder-member-filter').addEventListener('change', () => this.renderReminders());
        document.getElementById('reminder-type-filter').addEventListener('change', () => this.renderReminders());
        
        // 分析选项变更事件
        document.getElementById('analysis-member').addEventListener('change', () => this.generateAnalysis());
        document.getElementById('analysis-type').addEventListener('change', () => this.generateAnalysis());
        document.getElementById('analysis-period').addEventListener('change', () => this.generateAnalysis());
    },
    
    // 渲染仪表盘
    renderDashboard() {
        document.getElementById('family-count').textContent = `${this.familyMembers.length} 人`;
        
        const pendingReminders = this.reminders.filter(r => !r.completed);
        document.getElementById('reminder-count').textContent = `${pendingReminders.length} 项`;
        
        // 显示最近记录
        const recentRecords = [...this.healthRecords].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
        const recentRecordsEl = document.getElementById('recent-records');
        
        if (recentRecords.length === 0) {
            recentRecordsEl.textContent = '暂无记录';
        } else {
            recentRecordsEl.textContent = '';
            recentRecords.forEach(record => {
                const member = this.familyMembers.find(m => m.id === record.memberId);
                const recordDate = new Date(record.date).toLocaleDateString();
                const p = document.createElement('p');
                p.textContent = `${recordDate}: ${member ? member.name : '未知成员'} - ${record.type}`;
                recentRecordsEl.appendChild(p);
            });
        }
        
        // 显示健康预警
        const warningsCount = this.healthWarnings ? this.healthWarnings.length : 0;
        const warningsEl = document.getElementById('warning-count');
        if (warningsEl) {
            warningsEl.textContent = `${warningsCount} 项`;
            
            // 如果有危险级别的预警，添加高亮显示
            if (this.healthWarnings && this.healthWarnings.some(w => w.level === 'danger')) {
                warningsEl.classList.add('highlight');
            } else {
                warningsEl.classList.remove('highlight');
            }
        }
        
        // 显示健康计划
        const activePlans = this.healthPlans ? this.healthPlans.filter(p => !p.completedAt) : [];
        const plansEl = document.getElementById('plan-count');
        if (plansEl) {
            plansEl.textContent = `${activePlans.length} 项`;
        }
    },
    
    // 渲染家庭成员列表
    renderFamilyMembers() {
        const familyList = document.getElementById('family-list');
        familyList.innerHTML = '';
        
        if (this.familyMembers.length === 0) {
            const p = document.createElement('p');
            p.textContent = '暂无家庭成员，请添加';
            p.className = 'placeholder-text';
            familyList.appendChild(p);
            return;
        }
        
        this.familyMembers.forEach(member => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            
            const info = document.createElement('div');
            info.className = 'list-item-info';
            
            const name = document.createElement('h4');
            name.textContent = member.name;
            
            const details = document.createElement('p');
            details.textContent = `${member.gender}, ${member.age}岁, ${member.relationship}`;
            
            info.appendChild(name);
            info.appendChild(details);
            
            const actions = document.createElement('div');
            actions.className = 'list-item-actions';
            
            const editBtn = document.createElement('button');
            editBtn.textContent = '编辑';
            editBtn.addEventListener('click', () => this.editFamilyMember(member.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.className = 'delete';
            deleteBtn.addEventListener('click', () => this.deleteFamilyMember(member.id));
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            listItem.appendChild(info);
            listItem.appendChild(actions);
            
            familyList.appendChild(listItem);
        });
        
        // 更新筛选器选项
        this.updateMemberFilters();
    },
    
    // 更新成员筛选器
    updateMemberFilters() {
        const recordFilter = document.getElementById('record-member-filter');
        const reminderFilter = document.getElementById('reminder-member-filter');
        const analysisSelect = document.getElementById('analysis-member');
        
        // 保存当前选中的值
        const recordSelected = recordFilter.value;
        const reminderSelected = reminderFilter.value;
        const analysisSelected = analysisSelect.value;
        
        // 清除现有选项（保留"所有成员"选项）
        while (recordFilter.options.length > 1) {
            recordFilter.remove(1);
        }
        
        while (reminderFilter.options.length > 1) {
            reminderFilter.remove(1);
        }
        
        // 清除分析选择器的所有选项
        analysisSelect.innerHTML = '<option value="">选择家庭成员</option>';
        
        // 添加成员选项
        this.familyMembers.forEach(member => {
            const recordOption = document.createElement('option');
            recordOption.value = member.id;
            recordOption.textContent = member.name;
            recordFilter.appendChild(recordOption);
            
            const reminderOption = document.createElement('option');
            reminderOption.value = member.id;
            reminderOption.textContent = member.name;
            reminderFilter.appendChild(reminderOption);
            
            const analysisOption = document.createElement('option');
            analysisOption.value = member.id;
            analysisOption.textContent = member.name;
            analysisSelect.appendChild(analysisOption);
        });
        
        // 恢复选中的值
        if (recordSelected) recordFilter.value = recordSelected;
        if (reminderSelected) reminderFilter.value = reminderSelected;
        if (analysisSelected) analysisSelect.value = analysisSelected;
    },
    
    // 显示添加家庭成员模态框
    showAddFamilyModal(memberId = null) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const member = memberId ? this.familyMembers.find(m => m.id === memberId) : null;
        
        modalBody.innerHTML = `
            <h3>${member ? '编辑' : '添加'}家庭成员</h3>
            <form id="family-form">
                <div class="form-group">
                    <label for="name">姓名</label>
                    <input type="text" id="name" value="${member ? member.name : ''}" required>
                </div>
                <div class="form-group">
                    <label for="gender">性别</label>
                    <select id="gender" required>
                        <option value="男" ${member && member.gender === '男' ? 'selected' : ''}>男</option>
                        <option value="女" ${member && member.gender === '女' ? 'selected' : ''}>女</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="age">年龄</label>
                    <input type="number" id="age" min="0" max="120" value="${member ? member.age : ''}" required>
                </div>
                <div class="form-group">
                    <label for="relationship">关系</label>
                    <select id="relationship" required>
                        <option value="本人" ${member && member.relationship === '本人' ? 'selected' : ''}>本人</option>
                        <option value="配偶" ${member && member.relationship === '配偶' ? 'selected' : ''}>配偶</option>
                        <option value="父亲" ${member && member.relationship === '父亲' ? 'selected' : ''}>父亲</option>
                        <option value="母亲" ${member && member.relationship === '母亲' ? 'selected' : ''}>母亲</option>
                        <option value="儿子" ${member && member.relationship === '儿子' ? 'selected' : ''}>儿子</option>
                        <option value="女儿" ${member && member.relationship === '女儿' ? 'selected' : ''}>女儿</option>
                        <option value="其他" ${member && member.relationship === '其他' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
                <div class="form-buttons">
                    <button type="button" class="cancel">取消</button>
                    <button type="submit" class="submit">${member ? '保存' : '添加'}</button>
                </div>
            </form>
        `;
        
        modal.style.display = 'block';
        
        // 表单提交事件
        document.getElementById('family-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                gender: document.getElementById('gender').value,
                age: parseInt(document.getElementById('age').value),
                relationship: document.getElementById('relationship').value
            };
            
            if (member) {
                // 编辑现有成员
                this.updateFamilyMember(memberId, formData);
            } else {
                // 添加新成员
                this.addFamilyMember(formData);
            }
            
            this.closeModal();
        });
        
        // 取消按钮事件
        document.querySelector('.form-buttons .cancel').addEventListener('click', () => this.closeModal());
    },
    
    // 添加家庭成员
    addFamilyMember(data) {
        const newMember = {
            id: Date.now().toString(),
            ...data
        };
        
        this.familyMembers.push(newMember);
        this.saveData();
        this.renderFamilyMembers();
        this.renderDashboard();
    },
    
    // 更新家庭成员
    updateFamilyMember(id, data) {
        const index = this.familyMembers.findIndex(m => m.id === id);
        if (index !== -1) {
            this.familyMembers[index] = { ...this.familyMembers[index], ...data };
            this.saveData();
            this.renderFamilyMembers();
        }
    },
    
    // 编辑家庭成员
    editFamilyMember(id) {
        this.showAddFamilyModal(id);
    },
    
    // 删除家庭成员
    deleteFamilyMember(id) {
        if (confirm('确定要删除这个家庭成员吗？相关的健康记录和提醒也将被删除。')) {
            this.familyMembers = this.familyMembers.filter(m => m.id !== id);
            this.healthRecords = this.healthRecords.filter(r => r.memberId !== id);
            this.reminders = this.reminders.filter(r => r.memberId !== id);
            this.saveData();
            this.renderFamilyMembers();
            this.renderDashboard();
        }
    },
    
    // 更新指定的成员筛选器
    updateMemberFilter(filterId) {
        const filter = document.getElementById(filterId);
        if (!filter) return;
        
        // 保存当前选中的值
        const selected = filter.value;
        
        // 清除现有选项（保留第一个选项）
        while (filter.options.length > 1) {
            filter.remove(1);
        }
        
        // 添加成员选项
        this.familyMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            filter.appendChild(option);
        });
        
        // 恢复选中的值
        if (selected) filter.value = selected;
    },
    
    // 设置健康计划选项
    setupHealthPlanOptions() {
        // 更新成员筛选器
        this.updateMemberFilter('plan-member-filter');
        // 渲染健康计划
        this.renderHealthPlans();
    },
    
    // 关闭模态框
    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    healthApp.init();
});