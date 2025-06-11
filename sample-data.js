// 示例数据初始化脚本

// 初始化示例数据
function initSampleData() {
    // 检查是否已经初始化过示例数据
    if (localStorage.getItem('sampleDataInitialized')) {
        console.log('示例数据已初始化');
        return;
    }
    
    // 清除现有数据
    localStorage.removeItem('familyMembers');
    localStorage.removeItem('healthRecords');
    localStorage.removeItem('reminders');
    localStorage.removeItem('healthPlans');
    localStorage.removeItem('healthWarnings');
    
    // 添加示例家庭成员
    const familyMembers = [
        {
            id: '1',
            name: '张伟',
            gender: '男',
            age: 45,
            relationship: '本人',
            height: 175 // 身高（厘米）
        },
        {
            id: '2',
            name: '李娜',
            gender: '女',
            age: 42,
            relationship: '配偶',
            height: 165
        },
        {
            id: '3',
            name: '张小明',
            gender: '男',
            age: 15,
            relationship: '儿子',
            height: 170
        },
        {
            id: '4',
            name: '王芳',
            gender: '女',
            age: 68,
            relationship: '母亲',
            height: 160
        }
    ];
    
    // 添加示例健康记录
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const healthRecords = [
        {
            id: '101',
            memberId: '1',
            date: today.toISOString().split('T')[0],
            type: '常规检查',
            values: '体重 78kg, 血压 145/95, 血糖 6.2, 心率 75',
            notes: '工作压力大，睡眠不足'
        },
        {
            id: '102',
            memberId: '1',
            date: lastWeek.toISOString().split('T')[0],
            type: '常规检查',
            values: '体重 80kg, 血压 140/90, 血糖 6.0, 心率 72',
            notes: '需要控制饮食，增加运动'
        },
        {
            id: '103',
            memberId: '1',
            date: lastMonth.toISOString().split('T')[0],
            type: '常规检查',
            values: '体重 82kg, 血压 138/88, 血糖 5.8, 心率 70',
            notes: '体重有所增加，需要注意'
        },
        {
            id: '104',
            memberId: '2',
            date: today.toISOString().split('T')[0],
            type: '常规检查',
            values: '体重 58kg, 血压 125/80, 血糖 5.5, 心率 68',
            notes: '一切正常'
        },
        {
            id: '105',
            memberId: '2',
            date: lastWeek.toISOString().split('T')[0],
            type: '常规检查',
            values: '体重 57kg, 血压 120/78, 血糖 5.4, 心率 65',
            notes: '健康状况良好'
        },
        {
            id: '106',
            memberId: '3',
            date: today.toISOString().split('T')[0],
            type: '常规检查',
            values: '体重 65kg, 血压 118/75, 血糖 5.0, 心率 72',
            notes: '生长发育正常'
        },
        {
            id: '107',
            memberId: '4',
            date: today.toISOString().split('T')[0],
            type: '常规检查',
            values: '体重 62kg, 血压 150/95, 血糖 7.2, 心率 78',
            notes: '高血压，高血糖，需要定期服药'
        },
        {
            id: '108',
            memberId: '4',
            date: lastWeek.toISOString().split('T')[0],
            type: '常规检查',
            values: '体重 63kg, 血压 155/98, 血糖 7.5, 心率 80',
            notes: '需要严格控制饮食，定期检查'
        }
    ];
    
    // 添加示例提醒
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const reminders = [
        {
            id: '201',
            memberId: '1',
            title: '测量血压',
            date: tomorrow.toISOString().split('T')[0],
            type: '测量',
            notes: '早晚各测一次，记录数值',
            completed: false
        },
        {
            id: '202',
            memberId: '1',
            title: '服用降压药',
            date: today.toISOString().split('T')[0],
            type: '用药',
            notes: '早晚各一次，饭后服用',
            completed: false
        },
        {
            id: '203',
            memberId: '4',
            title: '复查血糖',
            date: nextWeek.toISOString().split('T')[0],
            type: '复查',
            notes: '空腹前往医院检查',
            completed: false
        },
        {
            id: '204',
            memberId: '4',
            title: '服用降糖药',
            date: today.toISOString().split('T')[0],
            type: '用药',
            notes: '每日三次，饭后服用',
            completed: false
        },
        {
            id: '205',
            memberId: '2',
            title: '年度体检',
            date: nextWeek.toISOString().split('T')[0],
            type: '体检',
            notes: '预约市中心医院体检中心',
            completed: false
        }
    ];
    
    // 添加示例健康计划
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const twoMonthsLater = new Date(today);
    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
    
    const healthPlans = [
        {
            id: '301',
            memberId: '1',
            type: 'diet',
            startDate: today.toISOString().split('T')[0],
            endDate: nextMonth.toISOString().split('T')[0],
            description: '低盐饮食，每日盐摄入量控制在5g以内，多食用富含钾的食物如香蕉、土豆等。避免高脂肪、高胆固醇食物。',
            goals: '降低血压至正常范围，减轻体重5kg',
            createdAt: today.toISOString()
        },
        {
            id: '302',
            memberId: '1',
            type: 'exercise',
            startDate: today.toISOString().split('T')[0],
            endDate: nextMonth.toISOString().split('T')[0],
            description: '每周进行5次有氧运动，如快走、慢跑、游泳等，每次40-60分钟。可适当增加力量训练，增加基础代谢率。',
            goals: '增强心肺功能，减轻体重',
            createdAt: today.toISOString()
        },
        {
            id: '303',
            memberId: '4',
            type: 'diet',
            startDate: today.toISOString().split('T')[0],
            endDate: twoMonthsLater.toISOString().split('T')[0],
            description: '低糖饮食，控制碳水化合物摄入，增加膳食纤维摄入。少食多餐，定时定量。',
            goals: '将血糖控制在正常范围内',
            createdAt: today.toISOString()
        },
        {
            id: '304',
            memberId: '4',
            type: 'checkup',
            startDate: today.toISOString().split('T')[0],
            endDate: nextMonth.toISOString().split('T')[0],
            description: '每周测量一次血压和血糖，记录数值变化。每月到医院进行一次全面检查。',
            goals: '定期监测健康状况，及时调整治疗方案',
            createdAt: today.toISOString()
        }
    ];
    
    // 保存示例数据到本地存储
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
    localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
    localStorage.setItem('reminders', JSON.stringify(reminders));
    localStorage.setItem('healthPlans', JSON.stringify(healthPlans));
    
    // 初始化空的健康预警数组（预警会由系统自动生成）
    localStorage.setItem('healthWarnings', JSON.stringify([]));
    
    // 标记示例数据已初始化
    localStorage.setItem('sampleDataInitialized', 'true');
    
    console.log('示例数据初始化完成');
}

// 在页面加载完成后初始化示例数据
document.addEventListener('DOMContentLoaded', () => {
    initSampleData();
});