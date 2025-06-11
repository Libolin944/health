// 健康预警相关功能
Object.assign(healthApp, {
    // 预警规则配置
    warningRules: {
        bloodPressure: {
            high: { min: 140, max: 180, level: 'warning' },
            veryHigh: { min: 180, max: Infinity, level: 'danger' },
            low: { min: 0, max: 90, level: 'warning' }
        },
        bloodSugar: {
            high: { min: 7.0, max: 11.1, level: 'warning' },
            veryHigh: { min: 11.1, max: Infinity, level: 'danger' },
            low: { min: 0, max: 3.9, level: 'warning' }
        },
        weight: {
            // 体重变化超过5%触发预警
            change: { percent: 5, level: 'warning' },
            // 体重变化超过10%触发危险预警
            severeChange: { percent: 10, level: 'danger' }
        },
        heartRate: {
            high: { min: 100, max: 120, level: 'warning' },
            veryHigh: { min: 120, max: Infinity, level: 'danger' },
            low: { min: 0, max: 50, level: 'warning' }
        }
    },
    
    // 初始化健康预警模块
    initWarningModule() {
        // 添加健康预警页面
        const main = document.querySelector('main');
        const analysisSection = document.getElementById('analysis');
        
        const warningSection = document.createElement('section');
        warningSection.id = 'warning';
        warningSection.className = 'page';
        warningSection.innerHTML = `
            <h2>健康预警</h2>
            <div class="action-bar">
                <select id="warning-member-filter">
                    <option value="all">所有成员</option>
                </select>
                <select id="warning-type-filter">
                    <option value="all">所有类型</option>
                    <option value="bloodPressure">血压异常</option>
                    <option value="bloodSugar">血糖异常</option>
                    <option value="weight">体重异常</option>
                    <option value="heartRate">心率异常</option>
                </select>
                <select id="warning-level-filter">
                    <option value="all">所有级别</option>
                    <option value="info">提示</option>
                    <option value="warning">警告</option>
                    <option value="danger">危险</option>
                </select>
            </div>
            <div id="health-warnings" class="list-container">
                <!-- 健康预警列表将在这里动态生成 -->
            </div>
        `;
        
        main.insertBefore(warningSection, analysisSection);
        
        // 添加事件监听
        document.getElementById('nav-warning').addEventListener('click', () => this.navigateTo('warning'));
        document.getElementById('warning-member-filter').addEventListener('change', () => this.renderWarnings());
        document.getElementById('warning-type-filter').addEventListener('change', () => this.renderWarnings());
        document.getElementById('warning-level-filter').addEventListener('change', () => this.renderWarnings());
        
        // 初始化成员筛选器
        this.updateMemberFilter('warning-member-filter');
        
        // 检查健康预警
        this.checkHealthWarnings();
        
        // 自动检查预警
        this.autoCheckWarnings();
    },
    
    // 设置预警选项
    setupWarningOptions() {
        // 更新成员筛选器
        this.updateMemberFilter('warning-member-filter');
    },
    
    // 检查健康预警
    checkHealthWarnings() {
        this.healthWarnings = [];
        
        // 遍历所有家庭成员
        this.familyMembers.forEach(member => {
            // 获取该成员的健康记录
            const memberRecords = this.healthRecords.filter(record => record.memberId === member.id);
            
            if (memberRecords.length === 0) return;
            
            // 按日期排序（最新的在前）
            memberRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // 检查血压预警
            this.checkBloodPressureWarning(member, memberRecords);
            
            // 检查血糖预警
            this.checkBloodSugarWarning(member, memberRecords);
            
            // 检查体重预警
            this.checkWeightWarning(member, memberRecords);
            
            // 检查心率预警
            this.checkHeartRateWarning(member, memberRecords);
        });
        
        // 渲染预警列表
        this.renderWarnings();
    },
    
    // 检查血压预警
    checkBloodPressureWarning(member, records) {
        // 获取最新的血压记录
        const bloodPressureRecords = records.filter(record => {
            return record.values && record.values.includes('血压');
        });
        
        if (bloodPressureRecords.length === 0) return;
        
        const latestRecord = bloodPressureRecords[0];
        const bloodPressureMatch = latestRecord.values.match(/血压\s*(\d+)\/(\d+)/);
        
        if (!bloodPressureMatch) return;
        
        const systolic = parseInt(bloodPressureMatch[1]); // 收缩压
        const diastolic = parseInt(bloodPressureMatch[2]); // 舒张压
        
        // 检查收缩压是否异常
        let warning = null;
        const rules = this.warningRules.bloodPressure;
        
        if (systolic >= rules.veryHigh.min) {
            warning = {
                memberId: member.id,
                type: 'bloodPressure',
                level: rules.veryHigh.level,
                message: `${member.name}的收缩压(${systolic}mmHg)严重偏高，请立即就医！`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        } else if (systolic >= rules.high.min) {
            warning = {
                memberId: member.id,
                type: 'bloodPressure',
                level: rules.high.level,
                message: `${member.name}的收缩压(${systolic}mmHg)偏高，建议监测并咨询医生。`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        } else if (systolic <= rules.low.max) {
            warning = {
                memberId: member.id,
                type: 'bloodPressure',
                level: rules.low.level,
                message: `${member.name}的收缩压(${systolic}mmHg)偏低，建议监测并咨询医生。`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        }
        
        if (warning) {
            this.healthWarnings.push(warning);
        }
        
        // 检查舒张压是否异常
        warning = null;
        
        if (diastolic >= 110) {
            warning = {
                memberId: member.id,
                type: 'bloodPressure',
                level: 'danger',
                message: `${member.name}的舒张压(${diastolic}mmHg)严重偏高，请立即就医！`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        } else if (diastolic >= 90) {
            warning = {
                memberId: member.id,
                type: 'bloodPressure',
                level: 'warning',
                message: `${member.name}的舒张压(${diastolic}mmHg)偏高，建议监测并咨询医生。`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        } else if (diastolic <= 60) {
            warning = {
                memberId: member.id,
                type: 'bloodPressure',
                level: 'warning',
                message: `${member.name}的舒张压(${diastolic}mmHg)偏低，建议监测并咨询医生。`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        }
        
        if (warning) {
            this.healthWarnings.push(warning);
        }
    },
    
    // 检查血糖预警
    checkBloodSugarWarning(member, records) {
        // 获取最新的血糖记录
        const bloodSugarRecords = records.filter(record => {
            return record.values && record.values.includes('血糖');
        });
        
        if (bloodSugarRecords.length === 0) return;
        
        const latestRecord = bloodSugarRecords[0];
        const bloodSugarMatch = latestRecord.values.match(/血糖\s*([\d\.]+)/);
        
        if (!bloodSugarMatch) return;
        
        const bloodSugar = parseFloat(bloodSugarMatch[1]);
        
        // 检查血糖是否异常
        let warning = null;
        const rules = this.warningRules.bloodSugar;
        
        if (bloodSugar >= rules.veryHigh.min) {
            warning = {
                memberId: member.id,
                type: 'bloodSugar',
                level: rules.veryHigh.level,
                message: `${member.name}的血糖(${bloodSugar}mmol/L)严重偏高，请立即就医！`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        } else if (bloodSugar >= rules.high.min) {
            warning = {
                memberId: member.id,
                type: 'bloodSugar',
                level: rules.high.level,
                message: `${member.name}的血糖(${bloodSugar}mmol/L)偏高，建议监测并咨询医生。`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        } else if (bloodSugar <= rules.low.max) {
            warning = {
                memberId: member.id,
                type: 'bloodSugar',
                level: rules.low.level,
                message: `${member.name}的血糖(${bloodSugar}mmol/L)偏低，建议监测并咨询医生。`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        }
        
        if (warning) {
            this.healthWarnings.push(warning);
        }
    },
    
    // 检查体重预警
    checkWeightWarning(member, records) {
        // 获取体重记录
        const weightRecords = records.filter(record => {
            return record.values && record.values.includes('体重');
        });
        
        if (weightRecords.length < 2) return; // 需要至少两条记录才能比较变化
        
        // 按日期排序（最旧的在前）
        weightRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // 获取最新和最旧的记录
        const oldestRecord = weightRecords[0];
        const latestRecord = weightRecords[weightRecords.length - 1];
        
        const oldestWeightMatch = oldestRecord.values.match(/体重\s*([\d\.]+)/);
        const latestWeightMatch = latestRecord.values.match(/体重\s*([\d\.]+)/);
        
        if (!oldestWeightMatch || !latestWeightMatch) return;
        
        const oldestWeight = parseFloat(oldestWeightMatch[1]);
        const latestWeight = parseFloat(latestWeightMatch[1]);
        
        // 计算体重变化百分比
        const changePercent = Math.abs((latestWeight - oldestWeight) / oldestWeight * 100);
        
        // 检查体重变化是否异常
        let warning = null;
        const rules = this.warningRules.weight;
        
        if (changePercent >= rules.severeChange.percent) {
            const changeType = latestWeight > oldestWeight ? '增加' : '减少';
            warning = {
                memberId: member.id,
                type: 'weight',
                level: rules.severeChange.level,
                message: `${member.name}的体重${changeType}了${changePercent.toFixed(1)}%，变化幅度较大，请关注！`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        } else if (changePercent >= rules.change.percent) {
            const changeType = latestWeight > oldestWeight ? '增加' : '减少';
            warning = {
                memberId: member.id,
                type: 'weight',
                level: rules.change.level,
                message: `${member.name}的体重${changeType}了${changePercent.toFixed(1)}%，请注意监测。`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        }
        
        if (warning) {
            this.healthWarnings.push(warning);
        }
    },
    
    // 检查心率预警
    checkHeartRateWarning(member, records) {
        // 获取最新的心率记录
        const heartRateRecords = records.filter(record => {
            return record.values && record.values.includes('心率');
        });
        
        if (heartRateRecords.length === 0) return;
        
        const latestRecord = heartRateRecords[0];
        const heartRateMatch = latestRecord.values.match(/心率\s*(\d+)/);
        
        if (!heartRateMatch) return;
        
        const heartRate = parseInt(heartRateMatch[1]);
        
        // 检查心率是否异常
        let warning = null;
        const rules = this.warningRules.heartRate;
        
        if (heartRate >= rules.veryHigh.min) {
            warning = {
                memberId: member.id,
                type: 'heartRate',
                level: rules.veryHigh.level,
                message: `${member.name}的心率(${heartRate}次/分钟)严重偏高，请立即就医！`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        } else if (heartRate >= rules.high.min) {
            warning = {
                memberId: member.id,
                type: 'heartRate',
                level: rules.high.level,
                message: `${member.name}的心率(${heartRate}次/分钟)偏高，建议监测并咨询医生。`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        } else if (heartRate <= rules.low.max) {
            warning = {
                memberId: member.id,
                type: 'heartRate',
                level: rules.low.level,
                message: `${member.name}的心率(${heartRate}次/分钟)偏低，建议监测并咨询医生。`,
                date: latestRecord.date,
                recordId: latestRecord.id
            };
        }
        
        if (warning) {
            this.healthWarnings.push(warning);
        }
    },
    
    // 渲染健康预警
    renderWarnings() {
        const warningList = document.getElementById('health-warnings');
        warningList.innerHTML = '';
        
        // 获取筛选条件
        const memberFilter = document.getElementById('warning-member-filter').value;
        const typeFilter = document.getElementById('warning-type-filter').value;
        const levelFilter = document.getElementById('warning-level-filter').value;
        
        // 筛选预警
        let filteredWarnings = this.healthWarnings || [];
        
        if (memberFilter !== 'all') {
            filteredWarnings = filteredWarnings.filter(warning => warning.memberId === memberFilter);
        }
        
        if (typeFilter !== 'all') {
            filteredWarnings = filteredWarnings.filter(warning => warning.type === typeFilter);
        }
        
        if (levelFilter !== 'all') {
            filteredWarnings = filteredWarnings.filter(warning => warning.level === levelFilter);
        }
        
        // 按日期排序（最新的在前）
        filteredWarnings.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredWarnings.length === 0) {
            const p = document.createElement('p');
            p.textContent = '当前筛选条件下暂无预警';
            p.className = 'placeholder-text';
            warningList.appendChild(p);
            return;
        }
        
        // 渲染预警列表
        filteredWarnings.forEach(warning => {
            const member = this.familyMembers.find(m => m.id === warning.memberId);
            const listItem = document.createElement('div');
            listItem.className = `list-item warning-item ${warning.level}`;
            
            const info = document.createElement('div');
            info.className = 'list-item-info';
            
            const title = document.createElement('h4');
            title.textContent = `${this.getWarningTypeText(warning.type)} - ${member ? member.name : '未知成员'}`;
            
            const date = document.createElement('p');
            date.textContent = `日期: ${new Date(warning.date).toLocaleDateString()}`;
            
            const message = document.createElement('p');
            message.textContent = warning.message;
            
            info.appendChild(title);
            info.appendChild(date);
            info.appendChild(message);
            
            const actions = document.createElement('div');
            actions.className = 'list-item-actions';
            
            const viewBtn = document.createElement('button');
            viewBtn.textContent = '查看记录';
            viewBtn.addEventListener('click', () => this.viewHealthRecord(warning.recordId));
            
            const ignoreBtn = document.createElement('button');
            ignoreBtn.textContent = '忽略';
            ignoreBtn.addEventListener('click', () => this.ignoreWarning(warning));
            
            actions.appendChild(viewBtn);
            actions.appendChild(ignoreBtn);
            
            listItem.appendChild(info);
            listItem.appendChild(actions);
            
            warningList.appendChild(listItem);
        });
    },
    
    // 获取预警类型文本
    getWarningTypeText(type) {
        const typeMap = {
            'bloodPressure': '血压异常',
            'bloodSugar': '血糖异常',
            'weight': '体重异常',
            'heartRate': '心率异常'
        };
        
        return typeMap[type] || type;
    },
    
    // 忽略预警
    ignoreWarning(warning) {
        this.healthWarnings = this.healthWarnings.filter(w => 
            !(w.memberId === warning.memberId && 
              w.type === warning.type && 
              w.date === warning.date && 
              w.recordId === warning.recordId));
        
        this.renderWarnings();
    },
    
    // 自动检查预警
    autoCheckWarnings() {
        // 如果有预警数据，检查是否有危险级别的预警
        if (this.healthWarnings && this.healthWarnings.length > 0) {
            const dangerWarnings = this.healthWarnings.filter(w => w.level === 'danger');
            
            if (dangerWarnings.length > 0) {
                alert(`⚠️ 警告：检测到${dangerWarnings.length}项严重健康异常，请立即查看！`);
            }
        } else {
            // 如果没有预警数据，执行检查
            this.checkHealthWarnings();
        }
    }
});