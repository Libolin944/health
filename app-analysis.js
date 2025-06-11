// 健康分析相关功能
Object.assign(healthApp, {
    // 设置分析选项
    setupAnalysisOptions() {
        // 更新成员选择下拉框
        const memberSelect = document.getElementById('analysis-member');
        memberSelect.innerHTML = '<option value="">选择家庭成员</option>';
        
        this.familyMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            memberSelect.appendChild(option);
        });
        
        // 添加风险预测选项
        const analysisType = document.getElementById('analysis-type');
        if (!analysisType.querySelector('option[value="riskPrediction"]')) {
            const option = document.createElement('option');
            option.value = 'riskPrediction';
            option.textContent = '疾病风险预测';
            analysisType.appendChild(option);
        }
        
        // 添加事件监听
        document.getElementById('analysis-member').addEventListener('change', this.generateAnalysis.bind(this));
        document.getElementById('analysis-type').addEventListener('change', this.generateAnalysis.bind(this));
        document.getElementById('analysis-period').addEventListener('change', this.generateAnalysis.bind(this));
    },
    
    // 生成健康分析
    generateAnalysis() {
        const memberId = document.getElementById('analysis-member').value;
        const analysisType = document.getElementById('analysis-type').value;
        const period = document.getElementById('analysis-period').value;
        
        if (!memberId) {
            document.querySelector('#chart-container .placeholder-text').textContent = '请选择家庭成员和分析类型';
            return;
        }
        
        // 获取成员记录
        const memberRecords = this.healthRecords.filter(record => record.memberId === memberId);
        
        if (memberRecords.length === 0) {
            document.querySelector('#chart-container .placeholder-text').textContent = '没有找到相关健康记录';
            return;
        }
        
        // 根据时间段筛选记录
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'halfYear':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        }
        
        const filteredRecords = memberRecords.filter(record => new Date(record.date) >= startDate);
        
        if (filteredRecords.length === 0) {
            document.querySelector('#chart-container .placeholder-text').textContent = '所选时间段内没有相关健康记录';
            return;
        }
        
        // 提取分析数据
        const analysisData = this.extractAnalysisData(filteredRecords, analysisType);
        
        if (analysisData.length === 0) {
            document.querySelector('#chart-container .placeholder-text').textContent = '没有找到可分析的数据';
            return;
        }
        
        // 隐藏占位文本
        document.querySelector('#chart-container .placeholder-text').style.display = 'none';
        
        // 生成图表
        this.renderChart(analysisData, analysisType);
    },
    
    // 提取分析数据
    extractAnalysisData(records, analysisType) {
        const data = [];
        
        // 如果是疾病风险预测，使用专门的解决方案处理
        if (analysisType === 'riskPrediction') {
            return this.calculateRiskPrediction(records);
        }
        
        // 根据分析类型提取数据
        records.forEach(record => {
            if (!record.values) return;
            
            const values = record.values.split(/[,，、]/);
            let found = false;
            
            values.forEach(value => {
                let match;
                
                switch (analysisType) {
                    case 'weight':
                        match = value.match(/体重[：:\s]*(\.?\d*)(?:kg|千克|公斤)?/i);
                        if (match) {
                            data.push({
                                date: record.date,
                                value: parseFloat(match[1])
                            });
                            found = true;
                        }
                        break;
                    case 'bloodPressure':
                        match = value.match(/血压[：:\s]*(\d+)\/(\d+)/i);
                        if (match) {
                            data.push({
                                date: record.date,
                                systolic: parseInt(match[1]),
                                diastolic: parseInt(match[2])
                            });
                            found = true;
                        }
                        break;
                    case 'bloodSugar':
                        match = value.match(/血糖[：:\s]*(\d+\.?\d*)/i);
                        if (match) {
                            data.push({
                                date: record.date,
                                value: parseFloat(match[1])
                            });
                            found = true;
                        }
                        break;
                }
            });
            
            // 如果在值中没有找到，尝试在描述中查找
            if (!found && record.description) {
                let match;
                
                switch (analysisType) {
                    case 'weight':
                        match = record.description.match(/体重[：:\s]*(\d+\.?\d*)(?:kg|千克|公斤)?/i);
                        if (match) {
                            data.push({
                                date: record.date,
                                value: parseFloat(match[1])
                            });
                        }
                        break;
                    case 'bloodPressure':
                        match = record.description.match(/血压[：:\s]*(\d+)\/(\d+)/i);
                        if (match) {
                            data.push({
                                date: record.date,
                                systolic: parseInt(match[1]),
                                diastolic: parseInt(match[2])
                            });
                        }
                        break;
                    case 'bloodSugar':
                        match = record.description.match(/血糖[：:\s]*(\d+\.?\d*)/i);
                        if (match) {
                            data.push({
                                date: record.date,
                                value: parseFloat(match[1])
                            });
                        }
                        break;
                }
            }
        });
        
        // 按日期排序
        return data.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    
    // 计算疾病风险预测
    calculateRiskPrediction(records) {
        // 提取最近的健康指标数据
        const latestData = {
            weight: null,
            bloodPressure: null,
            bloodSugar: null,
            heartRate: null
        };
        
        // 按日期降序排序记录
        const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 从最近的记录中提取数据
        for (const record of sortedRecords) {
            if (!record.values && !record.description) continue;
            
            const textToSearch = (record.values || '') + ' ' + (record.description || '');
            
            // 提取体重
            if (!latestData.weight) {
                const weightMatch = textToSearch.match(/体重[：:]\s*(\d+\.?\d*)(?:kg|千克|公斤)?/i);
                if (weightMatch) {
                    latestData.weight = parseFloat(weightMatch[1]);
                }
            }
            
            // 提取血压
            if (!latestData.bloodPressure) {
                const bpMatch = textToSearch.match(/血压[：:]\s*(\d+)\/(\d+)/i);
                if (bpMatch) {
                    latestData.bloodPressure = {
                        systolic: parseInt(bpMatch[1]),
                        diastolic: parseInt(bpMatch[2])
                    };
                }
            }
            
            // 提取血糖
            if (!latestData.bloodSugar) {
                const bsMatch = textToSearch.match(/血糖[：:]\s*(\d+\.?\d*)/i);
                if (bsMatch) {
                    latestData.bloodSugar = parseFloat(bsMatch[1]);
                }
            }
            
            // 提取心率
            if (!latestData.heartRate) {
                const hrMatch = textToSearch.match(/心率[：:]\s*(\d+)/i);
                if (hrMatch) {
                    latestData.heartRate = parseInt(hrMatch[1]);
                }
            }
            
            // 如果所有数据都已找到，则停止搜索
            if (latestData.weight && latestData.bloodPressure && latestData.bloodSugar && latestData.heartRate) {
                break;
            }
        }
        
        // 计算各种疾病风险
        const risks = [];
        
        // 高血压风险
        if (latestData.bloodPressure) {
            const { systolic, diastolic } = latestData.bloodPressure;
            let hypertensionRisk = 0;
            
            if (systolic >= 140 || diastolic >= 90) {
                hypertensionRisk = 0.8; // 高风险
            } else if (systolic >= 130 || diastolic >= 85) {
                hypertensionRisk = 0.5; // 中等风险
            } else if (systolic >= 120 || diastolic >= 80) {
                hypertensionRisk = 0.3; // 低风险
            } else {
                hypertensionRisk = 0.1; // 极低风险
            }
            
            risks.push({
                name: '高血压',
                risk: hypertensionRisk,
                advice: hypertensionRisk >= 0.5 ? 
                    '建议减少盐分摄入，增加有氧运动，定期监测血压' : 
                    '血压状况良好，建议保持健康生活方式'
            });
        }
        
        // 糖尿病风险
        if (latestData.bloodSugar) {
            let diabetesRisk = 0;
            
            if (latestData.bloodSugar >= 7.0) {
                diabetesRisk = 0.8; // 高风险
            } else if (latestData.bloodSugar >= 6.1) {
                diabetesRisk = 0.5; // 中等风险
            } else if (latestData.bloodSugar >= 5.6) {
                diabetesRisk = 0.3; // 低风险
            } else {
                diabetesRisk = 0.1; // 极低风险
            }
            
            risks.push({
                name: '糖尿病',
                risk: diabetesRisk,
                advice: diabetesRisk >= 0.5 ? 
                    '建议控制碳水化合物摄入，增加运动，定期监测血糖' : 
                    '血糖状况良好，建议保持均衡饮食'
            });
        }
        
        // 心血管疾病风险
        if (latestData.bloodPressure && latestData.bloodSugar) {
            let cvdRisk = 0;
            const { systolic } = latestData.bloodPressure;
            
            // 综合多个因素评估风险
            if (systolic >= 140 && latestData.bloodSugar >= 6.1) {
                cvdRisk = 0.7; // 高风险
            } else if (systolic >= 130 || latestData.bloodSugar >= 6.1) {
                cvdRisk = 0.4; // 中等风险
            } else {
                cvdRisk = 0.2; // 低风险
            }
            
            // 如果有心率数据，进一步调整风险
            if (latestData.heartRate) {
                if (latestData.heartRate > 100) {
                    cvdRisk += 0.1;
                } else if (latestData.heartRate < 60) {
                    cvdRisk += 0.05;
                }
            }
            
            risks.push({
                name: '心血管疾病',
                risk: Math.min(cvdRisk, 0.9), // 确保风险不超过0.9
                advice: cvdRisk >= 0.4 ? 
                    '建议减少饱和脂肪摄入，增加有氧运动，考虑咨询医生' : 
                    '心血管健康状况良好，建议保持健康生活方式'
            });
        }
        
        // 肥胖相关疾病风险
        if (latestData.weight) {
            // 假设我们有身高数据，这里使用一个示例值
            // 实际应用中应该从用户档案中获取身高
            const height = 1.7; // 单位：米
            const bmi = latestData.weight / (height * height);
            let obesityRisk = 0;
            
            if (bmi >= 30) {
                obesityRisk = 0.8; // 高风险
            } else if (bmi >= 25) {
                obesityRisk = 0.5; // 中等风险
            } else if (bmi >= 23) {
                obesityRisk = 0.3; // 低风险
            } else {
                obesityRisk = 0.1; // 极低风险
            }
            
            risks.push({
                name: '肥胖相关疾病',
                risk: obesityRisk,
                advice: obesityRisk >= 0.5 ? 
                    '建议控制热量摄入，增加运动，制定健康减重计划' : 
                    '体重状况良好，建议保持健康饮食和适量运动'
            });
        }
        
        return risks;
    },
    
    // 渲染图表
    renderChart(data, analysisType) {
        const chartContainer = document.getElementById('chart-container');
        const canvas = document.getElementById('analysis-chart');
        
        // 清除旧图表
        if (this.chart) {
            this.chart.destroy();
        }
        
        // 如果是疾病风险预测，使用特殊的渲染方法
        if (analysisType === 'riskPrediction') {
            this.renderRiskPredictionChart(data);
            return;
        }
        
        // 准备图表数据
        const labels = data.map(item => new Date(item.date).toLocaleDateString());
        let datasets = [];
        let title = '';
        
        switch (analysisType) {
            case 'weight':
                title = '体重趋势 (kg)';
                datasets = [{
                    label: '体重',
                    data: data.map(item => item.value),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true
                }];
                break;
            case 'bloodPressure':
                title = '血压趋势 (mmHg)';
                datasets = [
                    {
                        label: '收缩压',
                        data: data.map(item => item.systolic),
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        fill: false
                    },
                    {
                        label: '舒张压',
                        data: data.map(item => item.diastolic),
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: false
                    }
                ];
                break;
            case 'bloodSugar':
                title = '血糖趋势 (mmol/L)';
                datasets = [{
                    label: '血糖',
                    data: data.map(item => item.value),
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    fill: true
                }];
                break;
        }
        
        // 创建图表
        this.chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '日期'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: analysisType === 'bloodPressure' ? '血压 (mmHg)' : 
                                  analysisType === 'weight' ? '体重 (kg)' : '血糖 (mmol/L)'
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    },
    
    // 渲染疾病风险预测图表
    renderRiskPredictionChart(risks) {
        const chartContainer = document.getElementById('chart-container');
        const canvas = document.getElementById('analysis-chart');
        
        // 如果没有风险数据，显示提示信息
        if (!risks || risks.length === 0) {
            document.querySelector('#chart-container .placeholder-text').textContent = '没有足够的健康数据进行风险预测';
            document.querySelector('#chart-container .placeholder-text').style.display = 'block';
            return;
        }
        
        // 准备图表数据
        const labels = risks.map(item => item.name);
        const riskValues = risks.map(item => Math.round(item.risk * 100)); // 转换为百分比
        
        // 根据风险值确定颜色
        const backgroundColors = risks.map(item => {
            const risk = item.risk;
            if (risk >= 0.7) return 'rgba(231, 76, 60, 0.7)'; // 高风险 - 红色
            if (risk >= 0.4) return 'rgba(243, 156, 18, 0.7)'; // 中等风险 - 橙色
            return 'rgba(46, 204, 113, 0.7)'; // 低风险 - 绿色
        });
        
        // 创建图表
        this.chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '风险指数 (%)',
                    data: riskValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '疾病风险预测',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                return '建议: ' + risks[index].advice;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '风险指数 (%)'
                        }
                    }
                }
            }
        });
        
        // 创建风险建议列表
        this.renderRiskAdvice(risks);
    },
    
    // 渲染风险建议
    renderRiskAdvice(risks) {
        // 创建或清空建议容器
        let adviceContainer = document.getElementById('risk-advice-container');
        if (!adviceContainer) {
            adviceContainer = document.createElement('div');
            adviceContainer.id = 'risk-advice-container';
            adviceContainer.className = 'risk-advice-container';
            document.getElementById('chart-container').appendChild(adviceContainer);
        } else {
            adviceContainer.innerHTML = '';
        }
        
        // 添加标题
        const title = document.createElement('h3');
        title.textContent = '健康风险评估与建议';
        adviceContainer.appendChild(title);
        
        // 创建建议列表
        const adviceList = document.createElement('ul');
        adviceList.className = 'risk-advice-list';
        
        risks.forEach(risk => {
            const listItem = document.createElement('li');
            
            // 创建风险名称和等级
            const riskHeader = document.createElement('div');
            riskHeader.className = 'risk-header';
            
            const riskName = document.createElement('span');
            riskName.className = 'risk-name';
            riskName.textContent = risk.name;
            
            const riskLevel = document.createElement('span');
            riskLevel.className = 'risk-level';
            
            // 根据风险值确定等级文本和样式
            if (risk.risk >= 0.7) {
                riskLevel.textContent = '高风险';
                riskLevel.className += ' high-risk';
            } else if (risk.risk >= 0.4) {
                riskLevel.textContent = '中等风险';
                riskLevel.className += ' medium-risk';
            } else {
                riskLevel.textContent = '低风险';
                riskLevel.className += ' low-risk';
            }
            
            riskHeader.appendChild(riskName);
            riskHeader.appendChild(riskLevel);
            
            // 创建建议文本
            const advice = document.createElement('p');
            advice.className = 'risk-advice';
            advice.textContent = risk.advice;
            
            // 将所有元素添加到列表项
            listItem.appendChild(riskHeader);
            listItem.appendChild(advice);
            adviceList.appendChild(listItem);
        });
        
        adviceContainer.appendChild(adviceList);
    }
});