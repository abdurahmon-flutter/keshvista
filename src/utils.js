


export async function getPage() {
    const userType = localStorage.getItem('userType');
    let page;
    const isLogged = localStorage.getItem('isLoggedIn') === 'true';
    if(isLogged==true){
        if(userType=="TEACHER"){
            page = 'teacher';
        }else if(userType=="MAINMANAGER"){
            page = 'ceo';
        }

    }else{
        page = 'landing';
    }
    return page;
  }




export const ENDPOINT = import.meta.env.VITE_API_URL;
export const MAINMANAGER = import.meta.env.VITE_MAINMANAGER;