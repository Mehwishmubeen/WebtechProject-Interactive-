
    const API_URL = 'https://jsonplaceholder.typicode.com/posts';

    $(document).ready(function() {
      //  READ posts
      $.get(API_URL)
        .done(function(posts) {
          $('#loading').hide();
          posts.slice(0, 8).forEach(post => addPostCard(post));
          showToast('Posts loaded successfully!', 'success');
        })
        .fail(() => showToast('⚠️ Failed to load posts', 'danger'));

      // CREATE / UPDATE
      $('#postForm').submit(function(e) {
        e.preventDefault();
        const id = $('#postId').val();
        const title = $('#title').val();
        const body = $('#body').val();

        if (id) {
          // UPDATE
          $.ajax({
            url: `${API_URL}/${id}`,
            method: 'PUT',
            data: { title, body },
            success: function(updatedPost) {
              const card = $(`#post-${id}`);
              card.find('.card-title').text(updatedPost.title);
              card.find('.card-text').text(updatedPost.body);
              showToast('✏️ Post updated successfully!', 'info');
              resetForm();
            },
            error: () => showToast(' Failed to update post', 'danger')
          });
        } else {
          // CREATE
          $.post(API_URL, { title, body, userId: 1 })
            .done(function(newPost) {
              addPostCard(newPost);
              showToast(' New post added!', 'success');
              resetForm();
            })
            .fail(() => showToast(' Failed to add post', 'danger'));
        }
      });

      // DELETE
      $(document).on('click', '.deleteBtn', function() {
        const id = $(this).data('id');
        if (confirm('🗑️ Are you sure you want to delete this post?')) {
          $.ajax({
            url: `${API_URL}/${id}`,
            method: 'DELETE',
            success: function() {
              $(`#post-${id}`).remove();
              showToast(' Post deleted successfully!', 'danger');
            },
            error: () => showToast(' Failed to delete post', 'danger')
          });
        }
      });

      //EDIT
      $(document).on('click', '.editBtn', function() {
        const id = $(this).data('id');
        const title = $(this).data('title');
        const body = $(this).data('body');

        $('#postId').val(id);
        $('#title').val(title);
        $('#body').val(body);
        $('#submitBtn').text('Update Post').removeClass('btn-success').addClass('btn-warning');
        $('#cancelEdit').removeClass('d-none');
      });

      //Cancel Edit
      $('#cancelEdit').click(resetForm);

      // Helper: Add Post Card
      function addPostCard(post) {
        $('#postsContainer').prepend(`
          <div class="col-md-6 col-lg-4 mb-4" id="post-${post.id}">
            <div class="card post-card h-100">
              <div class="card-body">
                <h5 class="card-title">${post.title}</h5>
                <p class="card-text">${post.body}</p>
              </div>
              <div class="card-footer bg-white border-top d-flex justify-content-between">
                <button class="btn btn-sm btn-warning editBtn" data-id="${post.id}" data-title="${post.title}" data-body="${post.body}">✏️ Edit</button>
                <button class="btn btn-sm btn-danger deleteBtn" data-id="${post.id}">🗑️ Delete</button>
              </div>
            </div>
          </div>
        `);
      }

      // Helper: Reset form
      function resetForm() {
        $('#postId').val('');
        $('#title').val('');
        $('#body').val('');
        $('#submitBtn').text('Add Post').removeClass('btn-warning').addClass('btn-success');
        $('#cancelEdit').addClass('d-none');
      }

      // Helper: Toast message
      function showToast(message, type = 'info') {
        const toastId = 'toast-' + Date.now();
        const bgClass = {
          success: 'bg-success',
          danger: 'bg-danger',
          info: 'bg-info',
          warning: 'bg-warning'
        }[type] || 'bg-secondary';

        const toastHTML = `
          <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body">${message}</div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
          </div>
        `;
        $('#toastContainer').append(toastHTML);
        const toastEl = new bootstrap.Toast($('#' + toastId)[0], { delay: 3000 });
        toastEl.show();
      }
    });