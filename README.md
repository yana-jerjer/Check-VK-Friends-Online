# Check-VK-Friends-Online
Версия кода для расширения Google Chrome для отображения друзей (онлайн) ВКонтакте
Основа для расширения Google Chrome. 
В репозитории представлены: 
- manifest.json - манифест для расширения Google Chrome 
- background.js - основной код расширения
- jar серверной части для доступа к черновику Соглашения 
- files/agreement - черновик соглашения
- getAgreement - проект серверной части (Java)

При загрузке расширения Пользователю будет представлено Соглашение. 
При его принятии Пользователь получит запрос на доступ к элментам социальной сети "ВКонтакте". 
Если учетная запись Пользователя закрыта, будет выведено оповещение о необходимости входа на сайте.
Через API методы будут определены друзья Пользователя, находящиеся онлайн. 
Пользователь получит уведовления с именами друзей Онлайн.
