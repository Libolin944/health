// 健康管理计划相关功能
Object.assign(healthApp, {
    // 初始化健康管理计划模块
    initHealthPlanModule() {
        // 添加健康计划页面
        const main = document.querySelector('main');
        const analysisSection = document.getElementById('analysis');
        
        const planSection = document.createElement('section');
        planSection.id = 'health-plan';
        planSection.className = 'page';
        planSection.innerHTML = `
            <h2>健康管理计划</h2>
            <div class="action-bar">
                <select id="plan-member-filter">
                    <option value="all">所有成员</option>
                </select>
                <select id="plan-type-filter">
                    <option value="all">所有类型</option>
                    <option value="diet">饮食计划</option>
                    <option value="exercise">运动计划</option>
                    <option value="medication">用药计划</option>
                    <option value="checkup">体检计划</option>
                    <option value="other">其他计划</option>
                </select>
                <button id="add-health-plan">添加计划</button>
            </div>
            <div id="health-plans" class="list-container">
                <!-- 健康计划列表将在这里动态生成 -->
            </div>
        `;
        
        main.insertBefore(planSection, analysisSection);
        
        // 添加事件监听
        // 添加事件监听
        document.getElementById('nav-health-plan').addEventListener('click', () => this.navigateTo('health-plan'));
        document.getElementById('add-health-plan').addEventListener('click', () => this.showAddPlanModal());
        document.getElementById('plan-member-filter').addEventListener('change', () => this.renderHealthPlans());
        document.getElementById('plan-type-filter').addEventListener('change', () => this.renderHealthPlans());
        
        // 初始化成员筛选器
        this.updateMemberFilter('plan-member-filter');
        
        // 渲染健康计划
        this.renderHealthPlans();
    },
    
    // 渲染健康计划
    renderHealthPlans() {
        const plansList = document.getElementById('health-plans');
        plansList.innerHTML = '';
        
        // 获取筛选条件
        const memberFilter = document.getElementById('plan-member-filter').value;
        const typeFilter = document.getElementById('plan-type-filter').value;
        
        // 筛选计划
        let filteredPlans = this.healthPlans || [];
        
        if (memberFilter !== 'all') {
            filteredPlans = filteredPlans.filter(plan => plan.memberId === memberFilter);
        }
        
        if (typeFilter !== 'all') {
            filteredPlans = filteredPlans.filter(plan => plan.type === typeFilter);
        }
        
        // 按日期排序（最新的在前）
        filteredPlans.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        
        if (filteredPlans.length === 0) {
            const p = document.createElement('p');
            p.textContent = '暂无健康计划，请添加';
            p.className = 'placeholder-text';
            plansList.appendChild(p);
            return;
        }
        
        filteredPlans.forEach(plan => {
            const member = this.familyMembers.find(m => m.id === plan.memberId);
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            
            // 检查计划是否已完成
            const isCompleted = plan.completedAt !== undefined;
            if (isCompleted) {
                listItem.classList.add('completed');
            }
            
            // 检查计划是否已过期
            const isPastDue = !isCompleted && new Date(plan.endDate) < new Date();
            if (isPastDue) {
                listItem.classList.add('past-due');
            }
            
            const info = document.createElement('div');
            info.className = 'list-item-info';
            
            const title = document.createElement('h4');
            title.textContent = `${this.getPlanTypeText(plan.type)} - ${member ? member.name : '未知成员'}`;
            
            const date = document.createElement('p');
            date.textContent = `计划周期: ${new Date(plan.startDate).toLocaleDateString()} 至 ${new Date(plan.endDate).toLocaleDateString()}`;
            
            const details = document.createElement('p');
            details.textContent = plan.description;
            
            info.appendChild(title);
            info.appendChild(date);
            info.appendChild(details);
            
            const actions = document.createElement('div');
            actions.className = 'list-item-actions';
            
            const viewBtn = document.createElement('button');
            viewBtn.textContent = '查看';
            viewBtn.addEventListener('click', () => this.viewHealthPlan(plan.id));
            
            const editBtn = document.createElement('button');
            editBtn.textContent = '编辑';
            editBtn.addEventListener('click', () => this.editHealthPlan(plan.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.className = 'delete';
            deleteBtn.addEventListener('click', () => this.deleteHealthPlan(plan.id));
            
            actions.appendChild(viewBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            // 添加完成/取消完成按钮
            if (isCompleted) {
                const uncompleteBtn = document.createElement('button');
                uncompleteBtn.textContent = '取消完成';
                uncompleteBtn.className = 'uncomplete';
                uncompleteBtn.addEventListener('click', () => this.togglePlanCompletion(plan.id));
                actions.appendChild(uncompleteBtn);
            } else {
                const completeBtn = document.createElement('button');
                completeBtn.textContent = '标记完成';
                completeBtn.className = 'complete';
                completeBtn.addEventListener('click', () => this.togglePlanCompletion(plan.id));
                actions.appendChild(completeBtn);
            }
            
            listItem.appendChild(info);
            listItem.appendChild(actions);
            
            plansList.appendChild(listItem);
        });
    },
    
    // 显示添加健康计划模态框
    showAddPlanModal(planId = null) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const plan = planId ? this.healthPlans.find(p => p.id === planId) : null;
        
        modalBody.innerHTML = `
            <h3>${plan ? '编辑' : '添加'}健康管理计划</h3>
            <form id="plan-form">
                <div class="form-group">
                    <label for="plan-member">家庭成员</label>
                    <select id="plan-member" required>
                        <option value="">请选择家庭成员</option>
                        ${this.familyMembers.map(member => 
                            `<option value="${member.id}" ${plan && plan.memberId === member.id ? 'selected' : ''}>${member.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="plan-type">计划类型</label>
                    <select id="plan-type" required>
                        <option value="diet" ${plan && plan.type === 'diet' ? 'selected' : ''}>饮食计划</option>
                        <option value="exercise" ${plan && plan.type === 'exercise' ? 'selected' : ''}>运动计划</option>
                        <option value="medication" ${plan && plan.type === 'medication' ? 'selected' : ''}>用药计划</option>
                        <option value="checkup" ${plan && plan.type === 'checkup' ? 'selected' : ''}>体检计划</option>
                        <option value="other" ${plan && plan.type === 'other' ? 'selected' : ''}>其他计划</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="plan-start-date">开始日期</label>
                    <input type="date" id="plan-start-date" value="${plan ? plan.startDate : new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label for="plan-end-date">结束日期</label>
                    <input type="date" id="plan-end-date" value="${plan ? plan.endDate : new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label for="plan-description">计划描述</label>
                    <textarea id="plan-description" required>${plan ? plan.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="plan-goals">计划目标</label>
                    <textarea id="plan-goals" placeholder="例如：降低体重5kg、控制血压在正常范围内">${plan && plan.goals ? plan.goals : ''}</textarea>
                </div>
                <div class="form-buttons">
                    <button type="button" class="cancel">取消</button>
                    <button type="submit" class="submit">${plan ? '保存' : '添加'}</button>
                </div>
            </form>
        `;
        
        modal.style.display = 'block';
        
        // 表单提交事件
        document.getElementById('plan-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                memberId: document.getElementById('plan-member').value,
                type: document.getElementById('plan-type').value,
                startDate: document.getElementById('plan-start-date').value,
                endDate: document.getElementById('plan-end-date').value,
                description: document.getElementById('plan-description').value,
                goals: document.getElementById('plan-goals').value
            };
            
            if (plan) {
                // 编辑现有计划
                this.updateHealthPlan(planId, formData);
            } else {
                // 添加新计划
                this.addHealthPlan(formData);
            }
            
            this.closeModal();
        });
        
        // 取消按钮事件
        document.querySelector('.form-buttons .cancel').addEventListener('click', () => this.closeModal());
    },
    
    // 添加健康计划
    addHealthPlan(data) {
        if (!this.healthPlans) {
            this.healthPlans = [];
        }
        
        const newPlan = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date().toISOString()
        };
        
        this.healthPlans.push(newPlan);
        this.saveData();
        this.renderHealthPlans();
        this.renderDashboard();
    },
    
    // 更新健康计划
    updateHealthPlan(id, data) {
        const index = this.healthPlans.findIndex(p => p.id === id);
        if (index !== -1) {
            this.healthPlans[index] = { 
                ...this.healthPlans[index], 
                ...data,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            this.renderHealthPlans();
            this.renderDashboard();
        }
    },
    
    // 查看健康计划详情
    viewHealthPlan(id) {
        const plan = this.healthPlans.find(p => p.id === id);
        if (!plan) return;
        
        const member = this.familyMembers.find(m => m.id === plan.memberId);
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const planTypeMap = {
            'diet': '饮食计划',
            'exercise': '运动计划',
            'medication': '用药计划',
            'checkup': '体检计划',
            'other': '其他计划'
        };
        
        modalBody.innerHTML = `
            <h3>健康计划详情</h3>
            <div class="record-details">
                <p><strong>家庭成员:</strong> ${member ? member.name : '未知成员'}</p>
                <p><strong>计划类型:</strong> ${planTypeMap[plan.type] || plan.type}</p>
                <p><strong>开始日期:</strong> ${new Date(plan.startDate).toLocaleDateString()}</p>
                <p><strong>结束日期:</strong> ${new Date(plan.endDate).toLocaleDateString()}</p>
                <p><strong>计划描述:</strong> ${plan.description}</p>
                ${plan.goals ? `<p><strong>计划目标:</strong> ${plan.goals}</p>` : ''}
                <p><strong>创建时间:</strong> ${new Date(plan.createdAt).toLocaleString()}</p>
                ${plan.updatedAt ? `<p><strong>更新时间:</strong> ${new Date(plan.updatedAt).toLocaleString()}</p>` : ''}
                ${plan.completedAt ? `<p><strong>完成时间:</strong> ${new Date(plan.completedAt).toLocaleString()}</p>` : ''}
            </div>
            <div class="form-buttons">
                <button type="button" class="submit">关闭</button>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // 关闭按钮事件
        document.querySelector('.form-buttons .submit').addEventListener('click', () => this.closeModal());
    },
    
    // 编辑健康计划
    editHealthPlan(id) {
        this.showAddPlanModal(id);
    },
    
    // 删除健康计划
    deleteHealthPlan(id) {
        if (confirm('确定要删除这个健康计划吗？')) {
            this.healthPlans = this.healthPlans.filter(p => p.id !== id);
            this.saveData();
            this.renderHealthPlans();
            this.renderDashboard();
        }
    },
    
    // 切换计划完成状态
    togglePlanCompletion(id) {
        const plan = this.healthPlans.find(p => p.id === id);
        if (!plan) return;
        
        if (plan.completedAt) {
            // 如果已完成，则取消完成
            delete plan.completedAt;
        } else {
            // 如果未完成，则标记为完成
            plan.completedAt = new Date().toISOString();
        }
        
        this.saveData();
        this.renderHealthPlans();
        this.renderDashboard();
    },
    
    // 获取计划类型文本
    getPlanTypeText(type) {
        const typeMap = {
            'diet': '饮食计划',
            'exercise': '运动计划',
            'medication': '用药计划',
            'checkup': '体检计划',
            'other': '其他计划'
        };
        
        return typeMap[type] || type;
    },
    
    // 生成健康计划建议
    generateHealthPlanSuggestion(memberId) {
        const member = this.familyMembers.find(m => m.id === memberId);
        if (!member) return null;
        
        // 获取该成员的健康记录
        const memberRecords = this.healthRecords.filter(record => record.memberId === memberId);
        
        // 如果没有健康记录，返回基础建议
        if (memberRecords.length === 0) {
            return {
                diet: '建议均衡饮食，多摄入蔬果，控制油盐糖摄入。',
                exercise: '建议每周进行3-5次中等强度有氧运动，每次30分钟以上。',
                checkup: '建议每年进行一次全面体检。'
            };
        }
        
        // 分析健康记录，生成个性化建议
        const suggestions = {
            diet: '建议均衡饮食，多摄入蔬果，控制油盐糖摄入。',
            exercise: '建议每周进行3-5次中等强度有氧运动，每次30分钟以上。',
            checkup: '建议每年进行一次全面体检。'
        };
        
        // 检查是否有血压记录
        const bloodPressureRecords = memberRecords.filter(record => 
            record.values && record.values.includes('血压'));
            
        if (bloodPressureRecords.length > 0) {
            // 获取最新的血压记录
            const latestRecord = bloodPressureRecords.sort((a, b) => 
                new Date(b.date) - new Date(a.date))[0];
                
            const bloodPressureMatch = latestRecord.values.match(/血压\s*(\d+)\/(\d+)/);
            
            if (bloodPressureMatch) {
                const systolic = parseInt(bloodPressureMatch[1]); // 收缩压
                const diastolic = parseInt(bloodPressureMatch[2]); // 舒张压
                
                if (systolic >= 140 || diastolic >= 90) {
                    suggestions.diet = '建议低盐饮食，每日盐摄入量控制在5g以内，多食用富含钾的食物如香蕉、土豆等。避免高脂肪、高胆固醇食物。';
                    suggestions.exercise = '建议进行适度有氧运动，如散步、慢跑、游泳等，每周3-5次，每次30分钟。避免剧烈运动。';
                    suggestions.checkup = '建议每3个月测量一次血压，定期监测血脂、血糖等指标。';
                }
            }
        }
        
        // 检查是否有血糖记录
        const bloodSugarRecords = memberRecords.filter(record => 
            record.values && record.values.includes('血糖'));
            
        if (bloodSugarRecords.length > 0) {
            // 获取最新的血糖记录
            const latestRecord = bloodSugarRecords.sort((a, b) => 
                new Date(b.date) - new Date(a.date))[0];
                
            const bloodSugarMatch = latestRecord.values.match(/血糖\s*([\d\.]+)/);
            
            if (bloodSugarMatch) {
                const bloodSugar = parseFloat(bloodSugarMatch[1]);
                
                if (bloodSugar >= 7.0) {
                    suggestions.diet = '建议低糖饮食，控制碳水化合物摄入，增加膳食纤维摄入。少食多餐，定时定量。';
                    suggestions.exercise = '建议进行适度有氧运动，如散步、慢跑、游泳等，每周3-5次，每次30分钟。运动前后注意监测血糖。';
                    suggestions.checkup = '建议每3个月检测一次糖化血红蛋白，定期监测血糖、尿常规等指标。';
                }
            }
        }
        
        // 检查是否有体重记录
        const weightRecords = memberRecords.filter(record => 
            record.values && record.values.includes('体重'));
            
        if (weightRecords.length > 0) {
            // 获取最新的体重记录
            const latestRecord = weightRecords.sort((a, b) => 
                new Date(b.date) - new Date(a.date))[0];
                
            const weightMatch = latestRecord.values.match(/体重\s*([\d\.]+)/);
            
            if (weightMatch && member.height) {
                const weight = parseFloat(weightMatch[1]);
                const height = parseFloat(member.height) / 100; // 转换为米
                const bmi = weight / (height * height);
                
                if (bmi >= 24) {
                    suggestions.diet = '建议控制总热量摄入，增加蔬菜水果比例，减少精制碳水化合物和脂肪摄入。每餐八分饱，避免夜间进食。';
                    suggestions.exercise = '建议增加有氧运动，如快走、慢跑、游泳等，每周5次以上，每次40-60分钟。可适当增加力量训练，增加基础代谢率。';
                    suggestions.checkup = '建议每3-6个月监测一次体重、腰围，定期检查血脂、血糖、肝功能等指标。';
                } else if (bmi < 18.5) {
                    suggestions.diet = '建议增加总热量摄入，适当增加优质蛋白质和健康脂肪的摄入，如瘦肉、鱼、蛋、坚果等。';
                    suggestions.exercise = '建议进行适度力量训练，增加肌肉量，每周2-3次，每次30分钟。减少过度有氧运动。';
                    suggestions.checkup = '建议每6个月监测一次体重，定期检查营养状况相关指标。';
                }
            }
        }
        
        return suggestions;
    },
    
    // 显示健康计划建议模态框
    showPlanSuggestionModal(memberId) {
        const member = this.familyMembers.find(m => m.id === memberId);
        if (!member) return;
        
        const suggestions = this.generateHealthPlanSuggestion(memberId);
        if (!suggestions) return;
        
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <h3>${member.name}的健康计划建议</h3>
            <div class="record-details">
                <p><strong>饮食建议:</strong> ${suggestions.diet}</p>
                <p><strong>运动建议:</strong> ${suggestions.exercise}</p>
                <p><strong>体检建议:</strong> ${suggestions.checkup}</p>
            </div>
            <div class="form-buttons">
                <button type="button" class="cancel">关闭</button>
                <button type="button" class="submit" id="create-diet-plan">创建饮食计划</button>
                <button type="button" class="submit" id="create-exercise-plan">创建运动计划</button>
                <button type="button" class="submit" id="create-checkup-plan">创建体检计划</button>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // 关闭按钮事件
        document.querySelector('.form-buttons .cancel').addEventListener('click', () => this.closeModal());
        
        // 创建饮食计划按钮事件
        document.getElementById('create-diet-plan').addEventListener('click', () => {
            this.closeModal();
            this.showAddPlanModal();
            document.getElementById('plan-member').value = memberId;
            document.getElementById('plan-type').value = 'diet';
            document.getElementById('plan-description').value = suggestions.diet;
        });
        
        // 创建运动计划按钮事件
        document.getElementById('create-exercise-plan').addEventListener('click', () => {
            this.closeModal();
            this.showAddPlanModal();
            document.getElementById('plan-member').value = memberId;
            document.getElementById('plan-type').value = 'exercise';
            document.getElementById('plan-description').value = suggestions.exercise;
        });
        
        // 创建体检计划按钮事件
        document.getElementById('create-checkup-plan').addEventListener('click', () => {
            this.closeModal();
            this.showAddPlanModal();
            document.getElementById('plan-member').value = memberId;
            document.getElementById('plan-type').value = 'checkup';
            document.getElementById('plan-description').value = suggestions.checkup;
        });
    }
});