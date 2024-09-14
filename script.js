// グローバルスコープで map を一度だけ宣言
let map;
let markers = [];

// Google Maps JavaScript API の読み込みが完了した後に実行される関数
window.initMap = function() {
    // map を初期化
    const center = { lat: 35.682839, lng: 139.759455 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: center,
    });

    // ローカルストレージから保存されたマーカーを地図上に表示
    displayStoredMarkers(map);

    // 地図上のクリックイベントでマーカーを追加
    map.addListener('click', function(event) {
        console.log("クリックイベント発火");  // デバッグ用
        if (confirm('この地点をお気に入りに登録しますか？')) {
            console.log("マーカー登録の確認ダイアログ表示");  // デバッグ用
            addMarker(event.latLng, map, true);
            populateForm(event.latLng, ''); // placeName を空文字で渡す
        }
    });

    // map が初期化された後に検索ボックスを追加
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "場所を検索";
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    const searchBox = new google.maps.places.SearchBox(input);

    // 検索ボックスのイベントリスナー
    searchBox.addListener("places_changed", () => {
        
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // 既存のマーカーをクリア
        markers.forEach(marker => {
            marker.setMap(null);
        });
        markers = [];

        // 検索結果のマーカーを表示
        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }

            const marker = new google.maps.Marker({
                map,
                title: place.name,
                position: place.geometry.location,
            });
            markers.push(marker);

                    

            // 検索結果のマーカーにもクリックイベントリスナーを追加
            marker.addListener('click', function() {
                if (confirm('この地点をお気に入りに登録しますか？')) {
                    populateForm(this.getPosition(), place.name); // マーカーのpositionを渡す// place.name を渡す
                }
            });



            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
};


//  マーカーを追加する関数
function addMarker(location, map, isUserMarker = false) {
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: 'お気に入り',
        icon: { // iconプロパティを設定
          url: 'https://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/pink-dot.png', // ハート型のマーカー画像のURL
          scaledSize: new google.maps.Size(30, 30) // サイズを変更
        },
        customInfo: {
            info: `<div><p>ハッシュタグ: ${location.hashtag || '登録なし'}</p></div>`
        }
    });
    

    // マーカーのクリックイベントリスナーを追加
    marker.addListener('click', function() {
        const infoWindow = new google.maps.InfoWindow({
            content: this.customInfo.info
        });
        infoWindow.open(map, marker);
    });

    return marker; // ここで marker を返す
}

// フォームに緯度と経度を表示する関数
function populateForm(location, placeName) { // placeName パラメータを追加
    const latitude = location.lat();
    const longitude = location.lng();
    // URL パラメータを作成
    const url = `input.html?latitude=${latitude}&longitude=${longitude}&placeName=${encodeURIComponent(placeName || '')}`;

    // URL をコンソールに出力
    console.log("遷移するURL:", url);

    // URL に遷移
    window.location.href = url;
}


// 登録フォームを表示する関数
function openForm(location) {
    const latitude = location.lat(); // 緯度を取得
    const longitude = location.lng(); // 経度を取得
    // URL パラメータを作成
    const url = `input.html?latitude=${latitude}&longitude=${longitude}`;
    
    // URL をコンソールに出力 (デバッグ用)
    console.log("遷移するURL:", url);

    // input.html へ遷移
    window.location.href = url; 
}

// ローカルストレージから保存されたマーカーを地図上に表示する関数
function displayStoredMarkers(map) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.forEach(function(favorite) {
        const marker = new google.maps.Marker({ // marker変数に格納
            position: { lat: parseFloat(favorite.latitude), lng: parseFloat(favorite.longitude) },
            map: map,
            title: 'お気に入り',
            customInfo: {
                info: `<div><p>コメント: ${favorite.comment}</p></div>`
            }
        });
        markers.push(marker); // markers配列に追加
    });
}

// // お気に入りリストを表示する関数
// function displayFavoriteList() {
//     const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
//     const favoriteList = document.getElementById('favorite-items');
//     const hashtagSearch = document.getElementById('hashtag-search'); // 検索ボックスを取得
    
//     favoriteList.innerHTML = ''; // リストをクリア


//      // ハッシュタグ検索
//      const searchTerm = hashtagSearch.value.toLowerCase(); 
//      const filteredFavorites = favorites.filter(favorite => 
//          favorite.hashtag.toLowerCase().includes(searchTerm) 
//      );


//     favorites.forEach((favorite, index) => {
//         const listItem = document.createElement('li');
//         listItem.innerHTML = `#${favorite.hashtag}: ${favorite.comment} <button class="delete-button" data-index="${index}">削除</button>`; // 削除ボタンを追加
//         listItem.style.cursor = 'pointer';
        
//         listItem.addEventListener('click', function() {
//             const position = { lat: parseFloat(favorite.latitude), lng: parseFloat(favorite.longitude) };
//             map.panTo(position); // 地図を該当の位置に移動
//             new google.maps.InfoWindow({
//                 content: `<div><h3>${favorite.hashtag}</h3><p>${favorite.comment}</p></div>`
//             }).open(map, new google.maps.Marker({
//                 position: position,
//                 map: map,
//             }));
//         });


// お気に入りリストを表示する関数
function displayFavoriteList() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteList = document.getElementById('favorite-items');
    const hashtagSearch = document.getElementById('hashtag-search'); // 検索ボックスを取得

    favoriteList.innerHTML = ''; // リストをクリア

    // ハッシュタグ検索
    const searchTerm = hashtagSearch.value.toLowerCase();

    const filteredFavorites = favorites.filter(favorite =>
        favorite.hashtag.toLowerCase().includes(searchTerm)
    );


    filteredFavorites.forEach((favorite, index) => { // filteredFavorites を使う
        const listItem = document.createElement('li');
        listItem.innerHTML = `#${favorite.hashtag}: ${favorite.comment} <button class="delete-button" data-index="${index}">削除</button>`; // 削除ボタンを追加
        listItem.style.cursor = 'pointer';

        listItem.addEventListener('click', function() {
            const position = { lat: parseFloat(favorite.latitude), lng: parseFloat(favorite.longitude) };
            map.panTo(position); // 地図を該当の位置に移動
            new google.maps.InfoWindow({
                content: `<div><h3>${favorite.hashtag}</h3><p>${favorite.comment}</p></div>`
            }).open(map, new google.maps.Marker({
                position: position,
                map: map,
            }));
        });

         // 削除ボタンのクリックイベントリスナーを追加
         const deleteButton = listItem.querySelector('.delete-button');
         deleteButton.addEventListener('click', function() {
             // filteredFavorites のインデックスを取得
             const originalIndex = favorites.findIndex(f => f === favorite);
             deleteFavorite(originalIndex); // favorites のインデックスを渡す
             removeMarker(originalIndex);   // favorites のインデックスを渡す
         });

        favoriteList.appendChild(listItem);
    });
}

// // 検索ボックスの入力イベントリスナーを追加 (displayFavoriteList 関数の外に移動)
// const hashtagSearch = document.getElementById('hashtag-search');
// hashtagSearch.addEventListener('input', displayFavoriteList); // 入力が変更されるたびにリストを更

//         // 検索ボックスの入力イベントリスナーを追加
//         const hashtagSearch = document.getElementById('hashtag-search');
//         hashtagSearch.addEventListener('input', displayFavoriteList); // 入力が変更されるたびにリストを更新



//           // 削除ボタンのクリックイベントリスナーを追加
//           const deleteButton = listItem.querySelector('.delete-button');
//           deleteButton.addEventListener('click', function() {
//               deleteFavorite(index); 
//               // マーカーも削除 (詳細は後述)
//               removeMarker(index);
//           });

//         favoriteList.appendChild(listItem);
//     });
// }

// マーカーを削除する関数 
function removeMarker(index) {
    if (markers[index]) {
        markers[index].setMap(null); // 地図上からマーカーを削除
        markers.splice(index, 1); // markers配列からマーカーを削除

        // ローカルストレージからも削除
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}


// お気に入りを削除する関数
function deleteFavorite(index) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.splice(index, 1); // 該当アイテムを削除
    localStorage.setItem('favorites', JSON.stringify(favorites)); // 更新
    displayFavoriteList(); // リストを再表示
    location.reload(); // ページをリロード
}

// ページ読み込み時にお気に入りリストを表示
window.addEventListener('DOMContentLoaded', function() {
    displayFavoriteList();
});


// // ハートマーカー
// function addMarker(location, map, isUserMarker = false) {
//     const marker = new google.maps.Marker({
//         position: location,
//         map: map,
//         title: 'お気に入り',
//         icon: { // iconプロパティを設定
//           url: 'https://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/pink-dot.png', // ハート型のマーカー画像のURL
//           scaledSize: new google.maps.Size(30, 30) // サイズを変更
//         },
//         customInfo: {
//             info: `<div><p>ハッシュタグ: ${location.hashtag || '登録なし'}</p></div>`
//         }
//     });
// }