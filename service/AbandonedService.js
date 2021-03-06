/*
 실종 반려견 서비스
 DB insert, update, delete, select
 S3 deletes
*/
import DAM from "../DAM/AbandonedDAM"; //데이터베이스 엑세스 모듈
import { practice } from "../modules/S3"; //S3 연결 및 동작 모듈

class Service{
    /*
     파라미터를 keyword로 일치하는 정보를 응답
     @param place(string) : 장소
     @param num(number) : 전단지 번호
    */
    async select (place, num){
        try{
            const result = await DAM.select(place, num);
            return result;
        }catch(err){
            return false;
        }
    };

    /*
     실종 반려견 정보 DB insert
     @param form(obj) : 문자열 정보 객체
     @param files(obj) : 업로드된 이미지 정보 객체
     @param email(string) : 세션 이메일
    */
    async insert(form, files, email){
        form = JSON.parse(form);
        const ab_info = this.createInfo(form, files, email);
        try{
            const result = await DAM.insert(ab_info);
            return result;
        }catch(err){
            return false;
        }
    };
    
    /*
     실종 반려견 정보 DB update, S3 최신화
     @param form(obj) : 문자열 정보 객체
     @param files(obj) : 업로드된 파일 정보 객체
     @email email(string) : Authorization 이메일
    */
    async update(form, files, email){
        form = JSON.parse(form);
        const update = form.update;
        let {main_key, sb_keys, poster_key} = update;
        
        if(email !== update.email){
            console.error('abandeond update approach is not normal');
            main_key = files.main[0].key
            poster_key = files.poster[0].key
            Object.keys(sb_keys).forEach(f => {
                sb_keys[f] = files[f][0].key;
            })
            this.deleteFiles(main_key, poster_key, sb_keys);
            return false;
        }

        delete form.update;
        const ab_info = this.createInfo(form, files, false);

        try{
            const result = await DAM.update(ab_info, update.num);
            this.deleteFiles(main_key, poster_key, sb_keys);
            return result;
        }catch(err){
            main_key = files.main[0].key
            poster_key = files.poster[0].key
            Object.keys(sb_keys).forEach(f => {
                sb_keys[f] = files[f][0].key;
            })
            return false;
        }finally{
            this.deleteFiles(main_key, poster_key, sb_keys);
        }
    };
    
    /*
     실종 반려견 정보 삭제, S3 최신화
     @param body(obj) : 삭제할 정보 객체
     @param email(string) : Authorization 이메일
    */
    async delete(body, email){
        var {main_key, sb_keys, num, poster_key} = body;
        try{
            await DAM.delete(num, email);
            sb_keys = JSON.parse(sb_keys);
            this.deleteFiles(main_key, poster_key, sb_keys);
            return true;
        }catch(err){
            return false;
        }
    };
    /*
     insert, update 과정에 필요한 정보 리턴
     @param form(obj) : 문자열 정보 객체
     @param files(obj) : 업로드된 이미지 정보
     @param email(string) : 세션 이메일
     코드 중복으로 인한 분리
    */
    createInfo(form, files, email ){
        const sb_imgs = JSON.stringify({
            sb0 : files.sb0[0].key, 
            sb1 : files.sb1[0].key,
            sb2 : files.sb2[0].key
        });
        let ab_info = { 
            sb_imgs : sb_imgs,
            main_img : files.main[0].key,
            poster_img : files.poster[0].key
        };
        if(!!email){
            ab_info.email = email;
        }
        Object.keys(form).forEach(f => {
            ab_info[f] = form[f];
        })
        return ab_info;
    }

    /*
     S3 내의 이미지들을 삭제
     @param main_key : 삭제할 매인 이미지 키값
     @param poster_key : 삭제할 전단지 이미지 키값 
     @param sb_keys(obj) : 삭제할 서브이미지들 객체
     코드 중복으로 인한 불리
    */
    async deleteFiles(main_key, poster_key, sb_keys){
        const key = (key) => {
            return {Key : `abandoned/${key}`}
        }
        const d_arr = [];
        Object.keys(sb_keys).forEach(f => {
            d_arr.push(key(sb_keys[f]));
        })
        d_arr.push(key(main_key), key(poster_key));
        try{
            practice.deletes(d_arr);
        }catch(err){
            console.log(err);
        }
    };
};

module.exports = new Service();