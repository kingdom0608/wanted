FROM node:11.14.0-alpine
MAINTAINER WANTED <kingdom0608@gmail.com>

# app 폴더 만들기 - NodeJS 어플리케이션 폴더
RUN mkdir -p /app
# winston 등을 사용할떄엔 log 폴더도 생성

# 어플리케이션 폴더를 Workdir로 지정 - 서버가 동용
WORKDIR /app

# 서버 파일 복사 ADD [어플리케이션파일 위치] [컨테이너내부의 어플리케이션 파일위치]
# Dockerfile 과 서버파일이 같은위치에 있어서 ./
ADD ./ /app

# 패키지파일 받기
RUN npm install
RUN npm i @types/node

# 배포버젼으로 설정 - 이 설정으로 환경을 나눌 수 있습니다.
# ENV NODE_ENV=local

# 가상 머신에 오픈할 포트
EXPOSE 80

# 서버실행
CMD ["npm", "start"]
