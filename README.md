<h2>소개</h2>
<li><a href="https://www.happypuppy.link">배포중인 웹</a> 입니다.</li>
<li>Vue js와 Node js 기반으로 견주들을 위한 반응형 웹 어플리케이션을 만들어 보았습니다.</li><br>

<h2>간략한 설명</h2>
<li>해당 프로젝트는 Vue Cli를 이용하여 생성한 웹팩을 express에 run build한 프로젝트로 JS ES6를 기반으로 합니다.</li>
<li>멀티미디어 플랫폼으로 멀티미디어 업로드 및 동영상 스트리밍, 이미지 추출, PDF생성 기능을 제공합니다.</li>
<li>보안 토큰 및 문자열 암호기능으로 관련 지식이 부족하나 보안에 신경섰습니다.</li>
<li>Vue js의 자세한 정보를 확인하고 싶으시다면 <a href="https://github.com/SangkyuGoodboyYesDoitsgoi/HappyPuppy-vue">여기</a>를 클릭하세요.</li>
<br>
- 프로젝트의 대략적인 사용 기술의 버전은 다음과 같습니다.<br>
<li>node 12.14.1</li>
<li>npm 6.13.4</li>
<li>vue/cli 4.1.2</li>
<li>mysql 5.7.30</li>
<li>aws(ec2, rds, s3)</li>
<li>api : 네이버 - 로그인 및 지도 연관 검색어, 카카오 - 지도 및 장소 이미지</li>
<li>사용 모듈은 package.json를 참고하세요.</li>
<li>Vue js의 모듈 정보는 <a href="https://github.com/SangkyuGoodboyYesDoitsgoi/HappyPuppy-vue/blob/master/package.json">여기</a>를 클릭하세요.</li><br>

<h2>알림</h2>
<li>테스트 하시는 본인의 AWS-S3, AWS-RDS-MySQL이 필요합니다.</li>
<li>MySQL을 꼭 AWS-RDS를 이용할 필요는 없습니다. 로컬에 설치된 MySQL도 가능합니다. 단, 테스팅 환경이 로컬이 아니라면 외부 접속을 허용해야 합니다.</li>
<li>본인의 AWS-S3의 버킷을 퍼블릭 객체로 설정하지 마십시오. 서버 사이드에서 요청하여 응답합니다</li>
<li>네이버 로그인을 테스트해보고 싶으시다면 되도록 <a href="https://www.happypuppy.link/">배포중인 웹</a>에서 권장합니다. 로컬에서 테스트를 원하신다면 관련 config를 본인의 네이버 API 정보로 수정하세요.</li>
<br>

<h2>실행 전</h2>
1. 권한 명령어 없이 config, reserveImg 디렉토리를 생성하세요.<br>
2. config 디렉토리에 하단의 파일들을 생성합니다. config 디렉토리 내의 파일은 보안에 주의하세요.<br>
aws_config.json

	{
	    "accessKeyId": "<your aws acessKeyId>",	
	    "secretAccessKey": "<your aws accessKey>",	
	    "region": "<your aws region>"	
	}
	
db_config.json

	{
	    "host" : "<your mysql host>",	
	    "port" : <3306(default)>,	
	    "user" : "<your user>",   	
	    "password": "<your password>",	
	    "database": "<your database>",	
	    "connectionLimit": 30	
	}


mail_config.json

	{
	    "service" : "gmail",	
	    "auth" : {
		"user" : "<your gmail>",		
		"pass" : "<yout gmail password>"		
	    }
	}


3. 구글의 보안 수준이 낮음 앱 엑세스를 허용하세요. https://myaccount.google.com/lesssecureapps <br>
4. 로컬에서의 실행이 아니라면 구글의 내 구글 계정에 대한 엑세스를 허용하세요. https://accounts.google.com/DisplayUnlockCaptcha <br>
5. 포함된 db_create.txt의 내용으로 테이블을 생성하세요. <br>

<h2>실행</h2>
<li>npm install</li>
<li>npm start</li>
<li>localhost:3000으로 접속</li>

<h2>업데이트 예정</h2>
<li>시간이 허락된다면 Typescript 주입, 실시간 스트리밍 구현 예정입니다.</li>

<h2>감사합니다.</h2>
