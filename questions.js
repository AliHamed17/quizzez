const QUESTIONS = [
    {
        question: "What is result of: 10 + 5 * 2?",
        questionAr: "ما هو ناتج: 10 + 5 * 2؟",
        options: ["30", "20", "25", "10"],
        correctIndex: 1,
        explanation: "Order of operations (PEMDAS): 5*2=10, then 10+10=20."
    },
    {
        question: "What does 'str(100)' return?",
        questionAr: "ماذا تعيد 'str(100)'؟",
        options: ["100", "'100'", "Error", "Int"],
        correctIndex: 1,
        explanation: "str() converts the number to a string."
    },
    {
        question: "Which of these is a tuple?",
        questionAr: "أي مما يلي هو Tuple؟",
        options: ["[1, 2]", "{1, 2}", "(1, 2)", "<1, 2>"],
        correctIndex: 2,
        explanation: "Tuples use parentheses ()."
    },
    {
        question: "Output of: print('Py' + 'thon')?",
        questionAr: "ناتج: print('Py' + 'thon')؟",
        options: ["Python", "Py thon", "Error", "Py+thon"],
        correctIndex: 0,
        explanation: "The + operator concatenates strings."
    },
    {
        question: "How to get the last character of string 's'?",
        questionAr: "كيف تحصل على الحرف الأخير من النص 's'؟",
        options: ["s[-1]", "s[0]", "s.last()", "s[end]"],
        correctIndex: 0,
        explanation: "Negative index -1 refers to the last item."
    },
    {
        question: "What is 7 % 3?",
        questionAr: "ما هو ناتج 7 % 3؟",
        options: ["2", "1", "3", "4"],
        correctIndex: 1,
        explanation: "7 divided by 3 is 2 with a remainder of 1."
    },
    {
        question: "Which keyword imports a library?",
        questionAr: "أي كلمة تستخدم لاستيراد مكتبة؟",
        options: ["using", "include", "import", "from"],
        correctIndex: 2,
        explanation: "import is used to include modules."
    },
    {
        question: "Output of: bool(0)?",
        questionAr: "ناتج: bool(0)؟",
        options: ["True", "False", "Error", "0"],
        correctIndex: 1,
        explanation: "0 evaluates to False in Boolean logic."
    },
    {
        question: "What is the output of: 4 ** 2?",
        questionAr: "ما هو ناتج: 4 ** 2؟",
        options: ["8", "16", "6", "2"],
        correctIndex: 1,
        explanation: "** is the exponent operator (4 squared)."
    },
    {
        question: "Which function gives the absolute value?",
        questionAr: "أي دالة تعطي القيمة المطلقة؟",
        options: ["abs()", "absolute()", "mag()", "val()"],
        correctIndex: 0,
        explanation: "abs(-5) returns 5."
    },
    {
        question: "How to check if 'x' is greater than 10?",
        questionAr: "كيف تتحقق مما إذا كان 'x' أكبر من 10؟",
        options: ["x > 10", "x < 10", "x = 10", "x >= 10"],
        correctIndex: 0,
        explanation: "> is the greater than operator."
    },
    {
        question: "What is the output of: min(10, 5, 20)?",
        questionAr: "ما هو ناتج: min(10, 5, 20)؟",
        options: ["10", "20", "5", "Error"],
        correctIndex: 2,
        explanation: "min() returns the smallest value."
    },
    {
        question: "Which is NOT a valid variable name?",
        questionAr: "أيها ليس اسم متغير صالح؟",
        options: ["myVari", "_test", "class", "x1"],
        correctIndex: 2,
        explanation: "'class' is a reserved keyword in Python."
    },
    {
        question: "What does 'break' do?",
        questionAr: "ماذا تفعل 'break'؟",
        options: ["Stops program", "Exits loop", "Skips iteration", "Prints error"],
        correctIndex: 1,
        explanation: "break exits the current loop."
    },
    {
        question: "Output of: '5' * 2 ?",
        questionAr: "ناتج: '5' * 2 ؟",
        options: ["10", "55", "Error", "52"],
        correctIndex: 1,
        explanation: "Multiplying a string repeats it."
    },
    {
        question: "Which method turns 'abc' to 'ABC'?",
        questionAr: "أي طريقة تحول 'abc' إلى 'ABC'؟",
        options: ["upper()", "cap()", "lower()", "big()"],
        correctIndex: 0,
        explanation: ".upper() converts string to uppercase."
    },
    {
        question: "Output of: len([1, 2, [3, 4]])?",
        questionAr: "ناتج: len([1, 2, [3, 4]])؟",
        options: ["4", "3", "2", "Error"],
        correctIndex: 1,
        explanation: "The list has 3 elements: 1, 2, and the inner list."
    },
    {
        question: "How to assign multiple variables?",
        questionAr: "كيف تعين متغيرات متعددة؟",
        options: ["x, y = 1, 2", "x = 1, y = 2", "x y = 1 2", "All wrong"],
        correctIndex: 0,
        explanation: "Python supports multiple assignment: x, y = 1, 2."
    },
    {
        question: "What is the value of 'False or True'?",
        questionAr: "ما هي قيمة 'False or True'؟",
        options: ["False", "True", "None", "Error"],
        correctIndex: 1,
        explanation: "OR returns True if at least one operand is True."
    },
    {
        question: "How to write 'Hello' without a newline?",
        questionAr: "كيف تطبع 'Hello' بدون سطر جديد؟",
        options: ["print('Hello', end='')", "print('Hello', noline)", "write('Hello')", "echo 'Hello'"],
        correctIndex: 0,
        explanation: "The 'end' parameter controls the line ending."
    },
    {
        question: "What is 10 // 4?",
        questionAr: "ما هو ناتج 10 // 4؟",
        options: ["2.5", "2", "3", "4"],
        correctIndex: 1,
        explanation: "Floor division returns integer quotient (2)."
    },
    {
        question: "Correct way to declare a dictionary?",
        questionAr: "الطريقة الصحيحة للتصريح عن قاموس؟",
        options: ["{key: value}", "{key, value}", "[key: value]", "(key: value)"],
        correctIndex: 0,
        explanation: "Dictionaries use curly braces with colon key-value pairs."
    },
    {
        question: "What is math.sqrt(25)?",
        questionAr: "ما هو math.sqrt(25)؟",
        options: ["5", "5.0", "25", "Error"],
        correctIndex: 1,
        explanation: "Returns float 5.0."
    },
    {
        question: "How to get user input as an integer?",
        questionAr: "كيف تأخذ مدخلات المستخدم كعدد صحيح؟",
        options: ["int(input())", "input(int)", "readInt()", "scan()"],
        correctIndex: 0,
        explanation: "Wrap input() with int() to convert."
    },
    {
        question: "What does 'continue' do?",
        questionAr: "ماذا تفعل 'continue'؟",
        options: ["Stops loop", "Skips to next iteration", "Exits program", "Nothing"],
        correctIndex: 1,
        explanation: "continue skips the rest of the current loop iteration."
    },
    {
        question: "Output of: type(3.14)?",
        questionAr: "ناتج: type(3.14)؟",
        options: ["float", "int", "double", "decimal"],
        correctIndex: 0,
        explanation: "In Python, decimal numbers are floats."
    },
    {
        question: "Which is immutable?",
        questionAr: "أيها غير قابل للتغيير؟",
        options: ["List", "Dictionary", "Tuple", "Set"],
        correctIndex: 2,
        explanation: "Tuples cannot be changed after creation."
    },
    {
        question: "What does 'not True' equal?",
        questionAr: "ماذا يساوي 'not True'؟",
        options: ["True", "False", "1", "None"],
        correctIndex: 1,
        explanation: "The logical opposite of True is False."
    },
    {
        question: "Result of: 'a' in 'banana'?",
        questionAr: "نتيجة: 'a' in 'banana'؟",
        options: ["True", "False", "Error", "1"],
        correctIndex: 0,
        explanation: "'in' checks if the substring exists found."
    },
    {
        question: "Which operator means 'And'?",
        questionAr: "أي معامل يعني 'و' (And)؟",
        options: ["&", "&&", "and", "phrase"],
        correctIndex: 2,
        explanation: "Python uses the English word 'and'."
    }
];

// Combine shuffling export
module.exports = QUESTIONS;
