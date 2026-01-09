class HackerGame {
    constructor() {
        this.player = {
            name: "ANONYMOUS",
            level: 1,
            xp: 0,
            skills: {
                hacking: 10,
                scripting: 5,
                phishing: 0,
                brute: 0
            },
            resources: {
                money: 100,
                btc: 0.0001,
                anonymity: 85,
                botnet: 1
            },
            tools: {
                nmap: true,
                sqlmap: false,
                metasploit: false,
                aircrack: false
            },
            missions: []
        };
        
        this.currentHack = null;
        this.hackInterval = null;
        this.miningInterval = null;
        
        this.targets = [
            { id: 1, name: "Сайт школы", ip: "192.168.1.10", security: 20, reward: 50, difficulty: "easy" },
            { id: 2, name: "Сервер малого бизнеса", ip: "192.168.1.15", security: 40, reward: 100, difficulty: "easy" },
            { id: 3, name: "Блог хакера", ip: "192.168.1.20", security: 60, reward: 200, difficulty: "medium" },
            { id: 4, name: "Форум программистов", ip: "192.168.1.25", security: 75, reward: 350, difficulty: "medium" },
            { id: 5, name: "Корпоративный портал", ip: "192.168.1.30", security: 90, reward: 500, difficulty: "hard" },
            { id: 6, name: "Банк данных", ip: "192.168.1.35", security: 95, reward: 1000, difficulty: "hard" },
            { id: 7, name: "Правительственный сайт", ip: "192.168.1.40", security: 99, reward: 5000, difficulty: "hard" }
        ];
        
        this.marketItems = [
            { id: "vpn", name: "ПРЕМИУМ VPN", desc: "+10% анонимности", price: 50, effect: () => this.player.resources.anonymity = Math.min(100, this.player.resources.anonymity + 10) },
            { id: "exploit", name: "ЭКСПЛОЙТ КИТ", desc: "+5% к хакингу", price: 200, effect: () => this.player.skills.hacking += 5 },
            { id: "server", name: "СЕРВЕР БОТНЕТА", desc: "+5 ботов в сеть", price: 500, effect: () => this.player.resources.botnet += 5 },
            { id: "zeroday", name: "ZERO-DAY УЯЗВИМОСТЬ", desc: "Автоматический взлом", price: 1000, effect: () => this.addLog("Куплен 0-day эксплойт") },
            { id: "miner", name: "БИТКОИН МАЙНЕР", desc: "+0.001 BTC/час", price: 300, effect: () => this.startAutoMining() },
            { id: "antivirus", name: "АНТИВИРУС", desc: "Защита от обнаружения", price: 150, effect: () => this.player.resources.anonymity += 15 }
        ];
        
        this.init();
    }
    
    init() {
        this.updateUI();
        this.generateMissions();
        this.setupEventListeners();
        this.loadGame();
        
        document.getElementById('commandInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processCommand(e.target.value);
                e.target.value = '';
            }
        });
    }
    
    processCommand(cmd) {
        const output = document.getElementById('output');
        const inputLine = document.createElement('div');
        inputLine.className = 'line';
        inputLine.innerHTML = `<span class="prompt">root@hacker:~#</span> <span class="command">${cmd}</span>`;
        output.appendChild(inputLine);
        
        const args = cmd.toLowerCase().split(' ');
        const response = document.createElement('div');
        response.className = 'response';
        
        switch(args[0]) {
            case 'help':
                if (args[1]) {
                    response.innerHTML = this.getCommandHelp(args[1]);
                } else {
                    response.innerHTML = `
                    <strong>ДОСТУПНЫЕ КОМАНДЫ:</strong><br><br>
                    <strong>scan</strong> [ip] - сканировать цель<br>
                    <strong>hack</strong> [ip] - начать взлом<br>
                    <strong>phish</strong> [target] - фишинг атака<br>
                    <strong>brute</strong> [target] - брутфорс<br>
                    <strong>mine</strong> - майнить биткоины<br>
                    <strong>clear</strong> - очистить терминал<br>
                    <strong>status</strong> - показать статус<br>
                    <strong>whoami</strong> - информация об игроке<br>
                    <strong>tools</strong> - список инструментов<br>
                    <strong>missions</strong> - список миссий<br>
                    `;
                }
                break;
                
            case 'scan':
                if (args[1]) {
                    response.innerHTML = this.scanTarget(args[1]);
                } else {
                    response.innerHTML = "Использование: scan [ip]<br>Пример: scan 192.168.1.10";
                }
                break;
                
            case 'hack':
                if (args[1]) {
                    this.startHack(args[1]);
                    response.innerHTML = `Начинаю взлом цели ${args[1]}...`;
                } else {
                    response.innerHTML = "Использование: hack [ip]<br>Сначала найдите цель командой scan";
                }
                break;
                
            case 'phish':
                response.innerHTML = this.startPhishing(args[1] || "random");
                break;
                
            case 'brute':
                response.innerHTML = this.startBruteforce(args[1] || "ssh");
                break;
                
            case 'mine':
                response.innerHTML = this.startManualMining();
                break;
                
            case 'clear':
                output.innerHTML = '';
                return;
                
            case 'status':
                response.innerHTML = `
                Имя: ${this.player.name}<br>
                Уровень: ${this.player.level}<br>
                Навык хакинга: ${this.player.skills.hacking}%<br>
                Деньги: $${this.player.resources.money}<br>
                BTC: ${this.player.resources.btc}<br>
                Анонимность: ${this.player.resources.anonymity}%
                `;
                break;
                
            case 'whoami':
                response.innerHTML = `
                <strong>ИНФОРМАЦИЯ О ХАКЕРЕ:</strong><br><br>
                Псевдоним: ${this.player.name}<br>
                Уровень угрозы: ${this.player.level}<br>
                IP: 7f3b:d4c:22a:1::f3b (TOR)<br>
                Локация: СКРЫТО<br>
                Активность: ${this.player.missions.length} выполненных миссий
                `;
                break;
                
            case 'tools':
                let toolsList = "ВАШИ ИНСТРУМЕНТЫ:<br><br>";
                for (const [tool, owned] of Object.entries(this.player.tools)) {
                    toolsList += `${tool.toUpperCase()}: ${owned ? "✓" : "✗"}<br>`;
                }
                response.innerHTML = toolsList;
                break;
                
            case 'missions':
                if (this.player.missions.length === 0) {
                    response.innerHTML = "У вас нет активных миссий. Используйте команду 'scan' для поиска целей.";
                } else {
                    let missionsList = "АКТИВНЫЕ МИССИИ:<br><br>";
                    this.player.missions.forEach((mission, i) => {
                        missionsList += `${i+1}. ${mission}<br>`;
                    });
                    response.innerHTML = missionsList;
                }
                break;
                
            default:
                response.innerHTML = `Команда не найдена: ${cmd}<br>Введите 'help' для списка команд.`;
        }
        
        output.appendChild(response);
        output.scrollTop = output.scrollHeight;
        this.addLog(`Выполнена команда: ${cmd}`);
    }
    
    scanTarget(ip) {
        const target = this.targets.find(t => t.ip === ip);
        if (target) {
            return `
            <strong>РЕЗУЛЬТАТЫ СКАНИРОВАНИЯ ${ip}:</strong><br><br>
            Имя: ${target.name}<br>
            Сложность: ${target.difficulty.toUpperCase()}<br>
            Уровень защиты: ${target.security}/100<br>
            Порт 80: ОТКРЫТ (HTTP)<br>
            Порт 443: ОТКРЫТ (HTTPS)<br>
            Порт 22: ${target.security > 50 ? "ЗАКРЫТ" : "ОТКРЫТ"} (SSH)<br>
            Награда: $${target.reward}<br><br>
            Используйте команду: hack ${ip}
            `;
        } else {
            return `Цель ${ip} не найдена.<br>Попробуйте: scan 192.168.1.10`;
        }
    }
    
    startHack(ip) {
        const target = this.targets.find(t => t.ip === ip);
        if (!target) return;
        
        this.currentHack = {
            target: target,
            progress: 0,
            logs: [],
            successChance: Math.max(10, this.player.skills.hacking - target.security + 30)
        };
        
        document.getElementById('targetName').textContent = target.name;
        document.getElementById('hackModal').classList.remove('hidden');
        
        this.hackInterval = setInterval(() => {
            this.updateHack();
        }, 500);
    }
    
    updateHack() {
        if (!this.currentHack) return;
        
        const hack = this.currentHack;
        hack.progress += Math.random() * 5;
        
        const log = document.getElementById('hackLog');
        const progressBar = document.getElementById('hackProgress');
        const status = document.getElementById('hackStatus');
        
        if (hack.progress >= 100) {
            hack.progress = 100;
            this.completeHack();
        }
        
        progressBar.style.width = hack.progress + '%';
        
        const logMessages = [
            "Сканирование портов...",
            "Поиск уязвимостей...",
            "Обход фаервола...",
            "Подбор учетных данных...",
            "Эксплуатация уязвимости...",
            "Установка бэкдора...",
            "Кража данных..."
        ];
        
        if (Math.random() < 0.3 && hack.logs.length < logMessages.length) {
            const msg = logMessages[hack.logs.length];
            hack.logs.push(msg);
            log.innerHTML += `> ${msg}<br>`;
            log.scrollTop = log.scrollHeight;
        }
        
        status.textContent = `Взлом: ${Math.round(hack.progress)}% | Шанс успеха: ${hack.successChance}%`;
    }
    
    completeHack() {
        clearInterval(this.hackInterval);
        
        const hack = this.currentHack;
        const success = Math.random() * 100 < hack.successChance;
        
        setTimeout(() => {
            if (success) {
                this.player.resources.money += hack.target.reward;
                this.player.skills.hacking += 2;
                this.addXP(25);
                this.addLog(`УСПЕШНЫЙ ВЗЛОМ! Получено: $${hack.target.reward}`);
                
                const log = document.getElementById('hackLog');
                log.innerHTML += `<br><strong style="color:#00ff00">✓ ВЗЛОМ УСПЕШЕН!</strong><br>`;
                log.innerHTML += `<strong>Добыто: $${hack.target.reward}</strong><br>`;
                log.innerHTML += `<strong>Навык хакинга +2%</strong>`;
                
                // Удаляем взломанную цель
                const index = this.targets.findIndex(t => t.ip === hack.target.ip);
                if (index !== -1) {
                    this.targets.splice(index, 1);
                }
            } else {
                this.player.resources.anonymity -= 15;
                this.addLog(`ПРОВАЛ ВЗЛОМА! Анонимность -15%`);
                
                const log = document.getElementById('hackLog');
                log.innerHTML += `<br><strong style="color:#ff0000">✗ ВЗЛОМ ПРОВАЛЕН!</strong><br>`;
                log.innerHTML += `<strong>Обнаружены! Анонимность понижена</strong>`;
            }
            
            setTimeout(() => {
                document.getElementById('hackModal').classList.add('hidden');
                this.currentHack = null;
                this.updateUI();
                this.updateTargets();
            }, 3000
