$(document).ready(function() {
    const apiUrl = 'https://gendacproficiencytest.azurewebsites.net/API/ProductsAPI/';
    let products = [];
    let currentPage = 1;
    const pageSize = 10;
    fetchProducts();

    // Function to fetch products from the API
    function fetchProducts() {
        $('#loading').show();
        console.log("fetchProducts() called in script.js");
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(data) {
                console.log("AJAX GET request successful", data);
                products = data;
                currentPage = 1;
                displayProducts();
                $('#loading').hide();
            },
            error: function(error) {
                console.log("AJAX GET request failed", error);
                $('#loading').hide();
            }
        });
    }

    // Function to display products in a table with pagination
    function displayProducts(data) {
        $('#product-list').empty();

        // Sort products
        const sortBy = $('#sort-select').val();
        if (data) {
            sortProducts(sortBy, data);
        } else {
            sortProducts(sortBy, products);
        }

        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paginatedProducts = data ? data.slice(start, end) : products.slice(start, end);

        const table = $('<table class="table"></table>');
        const thead = $('<thead><tr><th style="padding-left: 85px; width: 50px;">Select</th><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Update</th></thead>');
        const tbody = $('<tbody></tbody>');

        paginatedProducts.forEach(product => {
            tbody.append(`
                <tr>
                    <td><input type="checkbox" class="product-checkbox" value="${product.Id}"></td>
                    <td>${product.Id}</td>
                    <td>${product.Name.replace(/^Product\s*/, '')}</td>
                    <td>${product.Category}</td>
                    <td>R${product.Price.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-light update-button" style="border-radius:15px;" data-id="${product.Id}" data-name="${product.Name}" data-category="${product.Category}" data-price="${product.Price}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                            </svg>
                        </button>
                    </td>
                </tr>
            `);
        });

        table.append(thead).append(tbody);
        $('#product-list').append(table);

        const totalPages = Math.ceil(products.length / pageSize);
        $('#pagination').empty();

        // pagination buttons
        const paginationButtons = getPaginationButtons(totalPages, currentPage);
        paginationButtons.forEach(page => {
            if (page === '...') {
                $('#pagination').append('<span class="mr-2">...</span>');
            } else {
                const button = $('<button class="btn mr-2"></button>').text(page);
                if (page === currentPage) {
                    button.addClass('active-page');
                }
                button.on('click', () => goToPage(page));
                $('#pagination').append(button);
            }
        });

        // Show or hide Next and Previous buttons
        if (currentPage === totalPages) {
            $('#next-page-button').hide();
        } else {
            $('#next-page-button').show();
        }

        if (currentPage === 1) {
            $('#prev-page-button').hide();
        } else {
            $('#prev-page-button').show();
        }

        // Add event listener to update buttons
        $('.update-button').on('click', function() {
            const id = $(this).data('id');
            const name = $(this).data('name').replace(/^Product\s*/, '');
            const category = $(this).data('category');
            const price = $(this).data('price');
            $('#updateProductId').val(id);
            $('#updateName').val(name);
            $('#updateCategory').val(category);
            $('#updatePrice').val(price);
            $('#updateProductModal').modal('show');
        });
    }

    // Function to generate pagination buttons
    function getPaginationButtons(totalPages, currentPage) {
        let pages = [];

        if (totalPages <= 1) {
            return [1];
        }
        pages.push(1);
        if (currentPage > 3) {
            pages.push('...');
        }
        for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) {
            pages.push('...');
        }
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    }

    // Function to sort products
    function sortProducts(criteria, productsArray) {
        productsArray.sort((a, b) => {
            if (criteria === 'name-asc') {
                return a.Name.localeCompare(b.Name);
            } else if (criteria === 'name-desc') {
                return b.Name.localeCompare(a.Name);
            } else if (criteria === 'category-asc') {
                return a.Category - b.Category;
            } else if (criteria === 'category-desc') {
                return b.Category - a.Category;
            } else if (criteria === 'id-asc') {
                return a.Id - b.Id;
            } else if (criteria === 'id-desc') {
                return b.Id - a.Id;
            } else {
                return 0;
            }
        });
    }

    // Function to navigate to a specific page
    window.goToPage = function(page) {
        if (page !== '...') {
            currentPage = page;
            displayProducts();
        }
    }

    // Function to create a new product
    window.createProduct = function() {
        const nameInput = $('#name').val().toUpperCase();
        const categoryInput = $('#category').val();
        const priceInput = $('#price').val();
        const namePattern = /^[A-Z]{3}\d{5}$/;
        const pricePattern = /^\d+(\.\d{1,2})?$/;

        if (!namePattern.test(nameInput)) {
            $('#name-error').show();
            return;
        } else {
            $('#name-error').hide();
        }

        if (!pricePattern.test(priceInput)) {
            $('#price-error').show();
            return;
        } else {
            $('#price-error').hide();
        }

        const product = {
            name: `Product ${nameInput}`,
            category: categoryInput,
            price: parseFloat(priceInput)
        };

        $.ajax({
            url: apiUrl,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(product),
            success: function() {
                $('#createProductModal').modal('hide');
                $('#successModal').modal('show');
                fetchProducts();
            },
            error: function(error) {
                console.log("AJAX POST request failed", error);
            }
        });
    };

    // validate the product name
    window.validateProductName = function() {
        const nameInput = $('#name').val().toUpperCase();
        const namePattern = /^[A-Z]{3}\d{5}$/;
        if (!namePattern.test(nameInput)) {
            $('#name-error').show();
        } else {
            $('#name-error').hide();
        }
    };

    // validate the product update name
    window.validateProductNameUpdate = function() {
        const nameInput = $('#name').val().toUpperCase();
        const namePattern = /^[A-Z]{3}\d{5}$/;
        if (!namePattern.test(nameInput)) {
            $('#nameUpdate-error').show();
        } else {
            $('#nameUpdate-error').hide();
        }
    };

    // validate the price input
    window.validateProductPrice = function() {
        // check for 2 decimal places
        const priceInput = $('#price').val();
        const pricePattern = /^\d+(\.\d{1,2})?$/;
    
        if (!pricePattern.test(priceInput)) {
            $('#price-error').show();
        } 
        if(/[^a-zA-Z0-9 ]/g.test(priceInput)){
            $('#price-error').show();
        }
        else {
            $('#price-error').hide();
        }
    };

    // Previous page button click event
    $('#prev-page-button').on('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayProducts();
        }
    });

    // Next page button click event
    $('#next-page-button').on('click', function() {
        const totalPages = Math.ceil(products.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts();
        }
    });

    // Sort products when filter criteria changes
    $('#apply-filter-button').on('click', function() {
        displayProducts();
        $('#filterModal').modal('hide');
    });

   // Delete selected products
    $('#delete-selected-button').on('click', function() {
        const selectedProductIds = $('.product-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        console.log("Deleting selected products with IDs", selectedProductIds);

        $('#loading').show(); // Show loading icon
        const deleteRequests = selectedProductIds.map(id => {
            return $.ajax({
                url: `${apiUrl}${id}`,
                method: 'DELETE'
            });
        });

        Promise.all(deleteRequests).then(() => {
            console.log("Selected products deleted successfully");
            fetchProducts();
            $('#message').text('Selected products deleted successfully!').show().fadeOut(3000);
            $('#loading').hide();
        }).catch(error => {
            console.log("Failed to delete selected products", error);
            $('#loading').hide();
        });
    });

    // Search button click event
    $('#search-button').on('click', function() {
        console.log("search clicked");
        const searchQuery = $('#search-input').val().trim();
        currentPage = 1;
        filterProducts(searchQuery);
    });

    // Function to clear search input and reset products display
    $('#clear-search').on('click', function() {
        $('#search-input').val('');
        displayProducts();
    });
    
    // Filter products based on search query
    function filterProducts(searchQuery) {
        console.log("in filt");
        const filteredProducts = products.filter(product =>
            product.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.Id.toString().includes(searchQuery) // Search by ID
        );
        console.log("FILTERED");
        console.log(filteredProducts);
        displayProducts(filteredProducts);
    }


    // Function to update a product
    window.updateProduct = function() {
        const id = $('#updateProductId').val();
        const name = $('#updateName').val()
        const category = $('#updateCategory').val();
        const price = $('#updatePrice').val();

        const product = {
            id: parseInt(id),
            name: `Product ${name}`,
            category: category,
            price: parseFloat(price)
        };

        $.ajax({
            url: `${apiUrl}${id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(product),
            success: function() {
                $('#updateProductModal').modal('hide');
                fetchProducts();
            },
            error: function(error) {
            }
        });
    };

});
