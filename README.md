# Team project - STYLiSH

## 開啟方式

1. 把 repo fork 到自己的 github 帳號下，然後 clone 下來
2. 用 `npm install` 安裝套件

```bash
cd team-project
cd frontend
npm install
cd ../backend
npm install
```

3. 用 `npm run dev` 開啟前端以及後端

```bash
cd team-project
cd frontend
npm run dev
cd ../backend
npm run dev
```

## 注意事項

1. 用之前記得先根據原本 example code 的 README 把 DB 資料灌進自己的資料庫
2. 這邊前端會在 5173 port (因為是用 vite)，後端會在 3000 port
3. 前端的 env 是用來設定後端的網址，這樣比較好修改
4. 範例後端中我唯一有改的是新增 native 的登入 route，以及修改 controller 中 native 登入沒寫完整的部分
5. 如果要創建 pull request ，請發到 develop branch
