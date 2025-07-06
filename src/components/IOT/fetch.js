async function fetchData() {
    axios.fetch( "https://oajfq8w29b.execute-api.ap-south-1.amazonaws.com/default/messages")
    .then( ( res ) => {
        return res;
    } )
    .catch( (err) => {
        console.error( err );
    })
}

export default fetchData;




