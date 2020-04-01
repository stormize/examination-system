var model = (function(){
        var questions = [];
        class question{
        text = "";
        choices = [];
        rightChoice = "";
        userChoice = "";
        marked = false;
        constructor(text,choices,rightChoice){
            this.text = text;
            this.choices = choices;
            this.rightChoice = rightChoice;
        }}
        var test = {
            questions : [],
            user : user,
            grade : 0,
            currentQuestion:0,
        }
        var user = {
            name : "",
            gender : "",
            age : -1,
            email : "",
        }
     return {
         //get data from endpoint and pass put it into questions array
        generateTest :async function(user) {
         //get data from end point
          var res =await  fetch("https://opentdb.com/api.php?amount=5&category=20&difficulty=easy&type=multiple");
         //put data into temp var 
          var temp = await res.json();
          //loop through data getched and map it to array of questions
            temp.results.forEach(element => {
                element.incorrect_answers.splice(Math.floor(Math.random()*3),0,element.correct_answer);
                questions.push(new question(element.question,element.incorrect_answers,element.correct_answer));
            });
        // return the array 
            try{
                test.questions = await  questions;
                test.user = user;
                console.log(test);
            }
            catch(e){
                console.log(e);
            }},
        updateQuestionAnswer:function(answer,index) {
                test.questions[index].userChoice = answer;
            },
        clearQuestionAnswer:function(index) {
            test.questions[index].userChoice = "";
        },
        getQuestion:async function(questionNumber){
                res = await test.questions[questionNumber];
                return await res},
        markOrUnmarkQuestion:function(index) {
            test.questions[index].marked=!test.questions[index].marked;
        },
        calculateGrade:function() {
            test.questions.forEach(element => {
                if(element.rightChoice === element.userChoice)
                    test.grade++;
            });
            return test;
        },
        
    
    
    }
})();

/***************************************************** */
var controller = ( function(modelController,viewController){ 
    //private 
    currentQuestion = 0;
    var getQuestion=async function(index){
        return await model.getQuestion(index);
    }
    return{
        init: async function(user) {
            await model.generateTest(user);
        },
        getNextQuestion:async function(){
            return await model.getQuestion(++currentQuestion);
        },
        getPrevQuestion: async function(){
            return await model.getQuestion(--currentQuestion);
        },
        getCurrentQuestion:async function() {
            return await model.getQuestion(currentQuestion);
        },
        getQuestionByIndex:async function(index) {
            currentQuestion = index;
            return await model.getQuestion(index);
        },
        getCurrentPosition:function() {
            return currentQuestion;
        },
        setQuestionAnswer:function(answer) {
            model.updateQuestionAnswer(answer,currentQuestion);
        },
        clearQuestionAnswer:function() {
            model.clearQuestionAnswer(currentQuestion);
        },
        calculateGrade:function() {
            return model.calculateGrade();
        },
        markOrUnmarkQuestion:function(){
            model.markOrUnmarkQuestion(currentQuestion);
        },
        validateName:function(name) {
            return new RegExp("^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$").test(name);
        },
        validateAge:function(age) {
        return new RegExp("^(?:1[01][0-9]|120|1[7-9]|[2-9][0-9])$").test(age);    
        },
        validateEmail:function(email) {
            return new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$").test(email);
        },
        
    }
})(model,view);

/************************************************* */
var view = (function(controller){
    //object that has all ids in html
    var ids={
        nameInput:'name',
        nameError:'name-error',
        ageInput:'age',
        ageError:'age-error',
        emailInput:'email',
        emailError:'email-error',
        genderInput:'gender',
        nameResult:'name-result',
        emailResult:"email-result",
        gradeResult:'grade-result',
        ageResult:'age-result',
        genderResult:'gender-result',
        submitForm:'submit',
        formCard:'form-card',
        form:'form',
        questionText:'question-text',
        questionCard:'question-card',
        nextBtn:'next',
        prevBtn:'prev',
        labeBtn:'label',
        choices:'choices',
        nav:"nav",
        submitAll:"submit-all",
        skip:"skip",
        sideNav:"side-nav",
        result:"result",
    }
     //object that has all regex needed
     var regex ={
        name : '',
        age : '',
        email : '',
    }
    //shortcut for selection
    var selectByID= function(id){
        return document.getElementById(id);
    }
    var parseQuestionToHtml=async function(params) {
        var question = await params;
        checkFirstOrLastQuestion();
        selectByID(ids.questionText).innerText = await question.text;
        selectByID(ids.choices).innerHTML = "";
        if(question.marked){
        selectByID(ids.skip).value = "unmark";
        selectByID(ids.skip).innerHTML = "unmark";
        }
        else{
        selectByID(ids.skip).value = "mark";
        selectByID(ids.skip).innerHTML = "mark";
        }
        question.choices.forEach(element => {
            choiceLabel=document.createElement("label")
            choiceLabel.innerHTML = element
            choiceLabel.className = "choice__label";
            choiceLabel.htmlFor = element;
            choiceRadio = document.createElement("input");
            choiceRadio.type = "radio";
            choiceRadio.value = element; 
            choiceRadio.id = element;
            choiceRadio.name = "choice";
            choiceRadio.className = "choice__radio";
         if(element === question.userChoice){
            choiceRadio.checked = true;
        }
            choice = document.createElement("div");
            choice.className = "choice";
            choice.appendChild(choiceRadio);
            choice.appendChild(choiceLabel);
            
            selectByID(ids.choices).appendChild(choice);
            
        });
    }

    var checkFirstOrLastQuestion = function(){
        var current = controller.getCurrentPosition();
        if(current ===0){
            selectByID(ids.prevBtn).style.visibility = "hidden";
            selectByID(ids.nextBtn).style.visibility = "visible"; 
        }
        else if(current ===4){
            selectByID(ids.nextBtn).style.visibility = "hidden";
            selectByID(ids.prevBtn).style.visibility = "visible";
        }
        else{
            selectByID(ids.prevBtn).style.visibility = "visible"; 
            selectByID(ids.nextBtn).style.visibility = "visible"; 
        }
    }
    var checkRadioIsChecked = function() {
        var current = controller.getCurrentPosition();
        if(document.querySelector('input[name = "choice"]:checked')){
            controller.setQuestionAnswer(document.querySelector('input[name = "choice"]:checked').value);
            selectByID(current.toString()).classList.remove("list-btn--danger");
            selectByID(current.toString()).classList.add("list-btn--succeed");
            }
            else{
              selectByID(current.toString()).classList.remove("list-btn--success");
             selectByID(current.toString()).classList.add("list-btn--danger");
              }
    }
    //get checked value in radio
    var getNextQuestion = async function() {

        selectByID(ids.questionCard).style.animation = "escape-right 1s linear";
        setTimeout(async function(params) {
            selectByID(ids.questionCard).style.animation = "none";
            var currentQuestion = controller.getCurrentPosition();
        selectByID(currentQuestion.toString()).classList.remove("list-btn--current");
        var question = await controller.getNextQuestion();
        parseQuestionToHtml(question);
        var currentQuestion = controller.getCurrentPosition();
        selectByID(currentQuestion.toString()).classList.add("list-btn--current");
        },1000);
        
    }
    var getPrevQuestion = async function() {
        selectByID(ids.questionCard).style.animation = "escape-left 1s linear";
setTimeout(async function() {
    selectByID(ids.questionCard).style.animation = "none";
    var currentQuestion = controller.getCurrentPosition();
    selectByID(currentQuestion.toString()).classList.remove("list-btn--current");
    var question = await controller.getPrevQuestion();
    parseQuestionToHtml(question);
    var currentQuestion = controller.getCurrentPosition();
    selectByID(currentQuestion.toString()).classList.add("list-btn--current");
},1000);
     
    }
    var mark = function(btn){
        if(btn.value ==="mark"){
       selectByID(controller.getCurrentPosition().toString()).querySelector("i").style.display="block";
       btn.value= btn.innerHTML = "unmark";
    }
        else{
            selectByID(controller.getCurrentPosition().toString()).querySelector("i").style.display="none";
            btn.innerHTML = "unmark";
            btn.value= btn.innerHTML = "mark";
        }
        controller.markOrUnmarkQuestion();
}
    return{
        init :  function() {
             if(selectByID(ids.form)){
               selectByID(ids.form).addEventListener("input",function(event){
                   switch(event.target.id){
                       case 'name':
                           if(event.target.value===""){
                            selectByID(ids.nameError).style.display = "none";
                            selectByID(ids.nameInput).style.borderBottomColor = "gray";
                           }
                           else{
                          if(!controller.validateName(event.target.value)){
                           selectByID(ids.nameError).style.display = "block";
                           selectByID(ids.nameInput).style.borderBottomColor = "red";
                          }
                            else{
                                selectByID(ids.nameError).style.display = "none";
                                selectByID(ids.nameInput).style.borderBottomColor = "green";
                            }}
                           break;
                        case 'email':
                                if(event.target.value ===""){ 
                                selectByID(ids.emailError).style.display = "none";
                                selectByID(ids.emailInput).style.borderBottomColor = "gray";}
                                  
                                     else{
                                        if( !controller.validateEmail(event.target.value)){
                                            selectByID(ids.emailError).style.display = "block";
                                            selectByID(ids.emailInput).style.borderBottomColor = "red";
                                           }
                                             else{
                                                 selectByID(ids.emailError).style.display = "none";
                                                 selectByID(ids.emailInput).style.borderBottomColor = "green";
                                             }
                                     }
                            break;
                        case 'age':
                                if(event.target.value ===""){
                                    selectByID(ids.ageError).style.display = "none";
                                    selectByID(ids.ageInput).style.borderBottomColor = "gray";
                                   }
                                   else{
                                if(!controller.validateAge(event.target.value)){
                                    selectByID(ids.ageError).style.display = "block";
                                    selectByID(ids.ageInput).style.borderBottomColor = "red";
                                   }
                                   
                                     else{
                                         selectByID(ids.ageError).style.display = "none";
                                         selectByID(ids.ageInput).style.borderBottomColor = "green";
                                     }}
                            break;
                       default:
                           break;
                   }
            });
               selectByID(ids.form).addEventListener("submit",async function(event){
                event.preventDefault();
                   if(controller.validateName(selectByID(ids.nameInput).value) 
                   && controller.validateEmail(selectByID(ids.emailInput).value) 
                   &&controller.validateAge(selectByID(ids.ageInput).value)){
                selectByID(ids.formCard).style.display = "none";
                selectByID(ids.questionCard).style.display = "flex";
                selectByID(ids.nav).style.display="flex";
                  await controller.init({
                  name:  selectByID(ids.nameInput).value,
                  age: selectByID(ids.ageInput).value,
                  email :  selectByID(ids.emailInput).value,
                  gender: document.querySelector('input[name = "gender"]:checked').value
                });
                parseQuestionToHtml(controller.getCurrentQuestion());
                selectByID("0").classList.add("list-btn--current");
            } 
        else{
             document.querySelector(".input-group__error").style.animate = "high-light-errors 0.2s 2"
        }
        
        });}
            selectByID(ids.nextBtn).addEventListener("click",async function() {
               checkRadioIsChecked();
                getNextQuestion();
             });
             selectByID(ids.prevBtn).addEventListener("click",async function() {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                ;
              checkRadioIsChecked();
                
                getPrevQuestion();
                
              })
              selectByID(ids.nav).addEventListener("click",function(event){
                switch(event.target.id){
                    case'0':
                    selectByID(currentQuestion.toString()).classList.remove("list-btn--current");
                    parseQuestionToHtml(controller.getQuestionByIndex(0));
                    selectByID("0").classList.add("list-btn--current");
                    break;
                    case '1':
                            selectByID(currentQuestion.toString()).classList.remove("list-btn--current");
                        parseQuestionToHtml(controller.getQuestionByIndex(1));
                        selectByID("1").classList.add("list-btn--current");
                    break;
                    case '2':
                            selectByID(currentQuestion.toString()).classList.remove("list-btn--current");
                        parseQuestionToHtml(controller.getQuestionByIndex(2));
                        selectByID("2").classList.add("list-btn--current");
                    break;
                    case '3':
                            selectByID(currentQuestion.toString()).classList.remove("list-btn--current");
                        parseQuestionToHtml(controller.getQuestionByIndex(3));
                        selectByID("3").classList.add("list-btn--current");
                    break;
                    case '4':
                            selectByID(currentQuestion.toString()).classList.remove("list-btn--current");
                        parseQuestionToHtml(controller.getQuestionByIndex(4));
                        selectByID("4").classList.add("list-btn--current");
                    break;
                    default:
                    break;
                }
              });
             selectByID(ids.submitAll).addEventListener("click",function(){
                 checkRadioIsChecked();
                test =  controller.calculateGrade();
                selectByID(ids.result).style.display = "flex";
                selectByID(ids.questionCard).style.display = "none";
                selectByID(ids.nav).style.display = "none";
                selectByID(ids.nameResult).innerHTML = test.user.name;
                selectByID(ids.ageResult).innerHTML = test.user.age;
                selectByID(ids.emailResult).innerHTML = test.user.email;
                selectByID(ids.genderResult).innerHTML = test.user.gender;
                selectByID(ids.gradeResult).innerHTML = test.grade + "/5";
              });
              selectByID(ids.skip).addEventListener("click",function(params) {
                  mark(selectByID(ids.skip));
              })
            }}
})(controller);
view.init();