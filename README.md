# wanted-server

<hr>

## 설치 및 실행
### 설치
- $npm install -g typescript
- $npm i @types/node
- $npm install

### 컴파일
- $npm run tsc

### 실행
- $npm start

<hr>

## 환경설정
### 환경변수 설정
- wanted > env > local.env 파일 생성
- local.env 파일에 환경변수 입력
```.dotenv
STAGE=local
MYSQL_HOST=localhost
MYSQL_USER=유저 입력
MYSQL_PASSWORD=비밀번호 입력
ENCRYPTION_SALT=07444f86-e2d2-42ee-b153-4786c21a4810
ENCRYPTION_DIGEST=sha512
```
### 데이터베이스 설정 및 동기화
- 로컬 데이터베이스에 local-wanted 스키마 생성
- $npm run sync
