const DAM = require('../DAM/Member');
const {practice} = require('../modules/S3');
const fs = require('fs');
const {transporter, from} = require('../modules/SendMail');
const createSecret = require('../modules/CreateSecret');
const delete_time = 900000; //메일 전송 정보 삭제 시간

const service = {
    /*
     회원 프로필 이미지 변경
     s3 업로드 및 기존 파일 삭제 후 DB Update, 임시 디렉토리의 이미지 삭제
     파라미터: file = 이미지 정보, body = S3 key, 기존 파일 존재 여부, email = 회원 이메일
    */
    updateImage : (file, body, email, callback) => {
        const bl = Number(body.n),
        insert_key = `member/${file.filename}`,
        delete_key = `member/${body.delete_key}`;

        practice.upload(insert_key, fs.readFileSync(file.path), (err) => {
            if(err){
                console.error('error is profile images s3 upload');
                fs.unlinkSync(file.path);
                callback(err);
                return;
            }
            console.log(`${email} profile image s3 upload success`);

            if(!!bl){
                practice.delete(delete_key, (err)=>{
                    if(err){
                        console.error('error is profile images s3 delete');
                    }
                })
            }

            DAM.update('profile_img', [file.filename, email], (err) => {
                if(err){
                    console.error('error is mysql profile image update');
                    practice.delete(delete_key, (err) =>{
                        if(err){
                            console.error('mysql execution failed because of its failure');
                            return
                        }
                        console.error('mysql execution was successful due to its failure');
                    })
                    callback(err);
                    return
                }
                console.log(`${email} profile updated success`);
                fs.unlinkSync(file.path);
                callback(err, file.filename);
            })
        })
    },
    /*
     인증 메일 전송
     메일 전송이 후 15분 뒤에 db 삭제
     파라미터 : email = 요청 이메일
    */
    sendMail: (email, callback) => {
        DAM.select('member', [email], (err, result) => {
            if(err || result[0].count < 1){
                !err || console.error(err);
                callback(err, false);
                return;
            }

            const pass_find = {
                certify_number : createSecret.createCertifyNumber(5, 5),
                wait_email : email,       
            }  
            const mailOptions = {
                from : from,
                to : email,
                subject : '해피퍼피 이메일 인증번호입니다.',
                text : "인증번호 : " + pass_find.certify_number
            }

            const key = 'pass_find';
            DAM.insert(key, pass_find, (err) => {
                if(err){
                    console.error(err);
                    callback(err);
                    return
                }

                transporter.sendMail(mailOptions, function(error, info){
                    !error || console.error(error);
                    callback(error, true);
                })
                setTimeout(() => {
                    DAM.delete(key, [email], (err) =>{
                        !err || console.error(err);
                    })
                }, delete_time)
            })
        })
    },
    //비밀 번호 변경
    findPass: (info, callback) => {
        const {email, certify_number, password} = info;
        DAM.select('pass_find', [certify_number, email], (err, result)=>{
            if(err || result.length < 1){
                !err || console.error(err);
                callback(err, true);
                return;
            }
            const values = [
                {password_data:JSON.stringify(createSecret.encryption(password))},
                email
            ]
            DAM.update('member', values, (err) => {
                !err || console.error(err);
                console.log(5)
                callback(err);
            })
        })
    },
    //회원의 대략적인 정보 응답
    getInfo : (email, callback) => {
        DAM.select('active_info',  [email], (err, result) => {
            !err || console.error(err);
            callback(err, result);
        })
    },
    //회원 채널의 대략적인 정보 응답
    getMediaInfo : (email, callback) => {
        DAM.select('channel_info', [email], (err, result) => {
            !err || console.error(err);
            callback(err, result);
        })
    },
    //회원 닉네임 변경
    updateNickname : (nickname, email, callback) => {
        DAM.update('nickname', [nickname, email], (err) => {
            !err || console.error(err);
            callback(err);
        })
    },
    //회원이 업로드한 행사 정보 응답
    getMyEvent : (email, callback) => {
        DAM.select('my_events', [email], (err, result) => {
            !err || console.error(err);
            callback(err, result);
        })
    },
    //회원이 업로드한 실종반려견 정보 응답
    getMyAbandoned : (email, callback) => {
        DAM.select('my_abandoneds', [email], (err, result) => {
            !err || console.error(err);
            callback(err, result);
        })
    },
    //회원이 업로드한 영상 정보, 해당 영상에 대한 댓글 정보 응답
    getMyMedias : (email, callback) => {
        const rs = {medias:null, comments:null};
        DAM.select('my_medias', [email], (err, result) => {
            if(err){
                console.error(err);
                callback(err);
                return;
            }
            rs.medias = result;
            const medias = result;
            const arr = [];
            for(let i = 0; i < result.length; i++){
                arr[i] = result[i].num;
            }
            if(arr.length > 0){
                DAM.select('my_comments', [arr], (err, result) => {
                    if(err){
                        console.error(err);
                        callback(err);
                        return;
                    }
                    const r_arr = [];
                    const p_arr = [];
                    const c_arr = [];

                    for(let i = 0; i < result.length; i++){
                        if(!result[i].c_target){
                            p_arr.push(result[i]);
                        }else{
                            c_arr.push(result[i]);
                        }
                    }

                    for(let i = 0; i < p_arr.length; i++){
                        const obj = {comment:p_arr[i]};
                        const arr = [];
                        for(let j = 0; j < c_arr.length; j++){
                            if(c_arr[j].c_target === p_arr[i].num){
                                arr.push(c_arr[j]);
                                c_arr.splice(j-- ,1);
                            }
                        }
                        obj.in_comments = arr;
                        r_arr.push(obj);
                    }
                    
                    const comments = [];
                    for(let i = 0; i < medias.length; i++){
                        comments[i] = {title:medias[i].title};
                        comments[i].comments = [];
                        for(let j = 0; j<r_arr.length; j++){
                            if(medias[i].num === r_arr[j].comment.m_target){
                                comments[i].comments.push(r_arr[j]);
                                r_arr.splice(j--, 1);
                            }
                        }
                    }

                    rs.comments = comments;
                    callback(err, rs);
                })
            }else{
                rs.comments = arr;
                callback(err, rs);
            }
        })
    }
}

module.exports.service = service;