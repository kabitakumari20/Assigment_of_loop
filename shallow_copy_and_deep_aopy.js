
// // shallow copy========
// const originalArray = [1, 2, 3, [4, 5]];

// const newarr = [...originalArray]
// // console.log('newarr=========>>', newarr)
// newarr[0] = 30
// const arr = originalArray//shallow copy
// // console.log("arr=======>>", arr)
// arr[1] = 10
// // console.log(arr)//[ 1, 10, 3, [ 4, 5 ] ]
// // console.log(newarr)//[ 30, 2, 3, [ 4, 5 ] ]
// console.log(originalArray)//[ 1, 10, 3, [ 4, 5 ] ]



// // deep copy========

// const originalArray1 = [1, 2, 3, [4, 5]];
// const shallowCopyArray = originalArray1.slice();

// // Modify the shallow copy
// shallowCopyArray[0] = 10;
// shallowCopyArray[3][0] = 40;

// // Original array remains unchanged because the nested array is still referenced
// console.log(originalArray1); // Output: [1, 2, 3, [40, 5]]
// // console.log(shallowCopyArray); // Output: [10, 2, 3, [40, 5]]




// let str = "manvipriyankakabita";
// let obj = {}
// for (let i = 0; i < str.length; i++) {
//     let char = str[i];
//     if (!obj[char]) {
//         obj[char] = 1
//     } else {
//         obj[char]++
//     }

// }
// console.log(obj)



setTimeout(function () {
    console.log("Inside setTimeout first");
}, 2000);


function withoutAsync() {
    console.log("Start");
    setTimeout(function () {
        console.log("Inside setTimeout");
    }, 2000);
    console.log("End");
}

withoutAsync();
console.log("outside console Start");




// setTimeout(function () {
//     console.log("Inside setTimeout first one");
// }, 2000);


// async function withAsync() {
//     console.log("Start");

//     await new Promise(resolve => {
//     setTimeout(function () {
//         console.log("Inside setTimeout");
//         // resolve();
//     }, 2000);
//     });

//     console.log("End");
// }

// withAsync();


