import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "../../services/adminService";

import "../../styles/admin-categories.css";

function getCategoriesFromResponse(response) {
  const candidates = [
    response?.categories,
    response?.data?.categories,
    response?.data?.data?.categories,
    response?.data,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getCategoryId(category) {
  return category?._id || category?.id || category?.categoryId;
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // ===============================
  // FETCH CATEGORIES
  // ===============================

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCategories();

      console.log("ADMIN CATEGORIES API RESPONSE:", response);

      const categoryList = getCategoriesFromResponse(response);

      setCategories(categoryList);
    } catch (err) {
      console.error("ADMIN CATEGORIES ERROR:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ===============================
  // FORM INPUT HANDLING
  // ===============================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });

    setEditingCategory(null);
  };

  // ===============================
  // CREATE / UPDATE CATEGORY
  // ===============================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setMessage("Please enter a category name.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      if (editingCategory) {
        const categoryId = getCategoryId(editingCategory);

        if (!categoryId) {
          throw new Error("Category ID was not found.");
        }

        await updateAdminCategory(categoryId, {
          name,
          description,
        });

        setMessage("Category updated successfully.");
      } else {
        await createAdminCategory({
          name,
          description,
        });

        setMessage("Category created successfully.");
      }

      resetForm();
      await fetchCategories();
    } catch (err) {
      console.error("CATEGORY SAVE ERROR:", err);
      setMessage(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ===============================
  // EDIT CATEGORY
  // ===============================

  const handleEdit = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category?.name || "",
      description: category?.description || "",
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===============================
  // ACTIVATE / DEACTIVATE
  // ===============================

  const handleToggleStatus = async (category) => {
    const categoryId = getCategoryId(category);

    if (!categoryId) {
      setMessage("Category ID was not found.");
      return;
    }

    const currentStatus = category?.isActive !== false;
    const nextStatus = !currentStatus;

    const action = nextStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setMessage("");

      await updateAdminCategory(categoryId, {
        isActive: nextStatus,
      });

      setMessage(`Category ${action}d successfully.`);

      await fetchCategories();
    } catch (err) {
      console.error("CATEGORY STATUS ERROR:", err);
      setMessage(getErrorMessage(err));
    }
  };

  // ===============================
  // DELETE CATEGORY
  // ===============================

  const handleDelete = async (category) => {
    const categoryId = getCategoryId(category);

    if (!categoryId) {
      setMessage("Category ID was not found.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setMessage("");

      await deleteAdminCategory(categoryId);

      setMessage("Category deleted successfully.");

      if (editingCategory && getCategoryId(editingCategory) === categoryId) {
        resetForm();
      }

      await fetchCategories();
    } catch (err) {
      console.error("CATEGORY DELETE ERROR:", err);
      setMessage(getErrorMessage(err));
    }
  };

  // ===============================
  // SEARCH
  // ===============================

  const filteredCategories = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return categories;

    return categories.filter((category) => {
      const name = category?.name?.toLowerCase() || "";
      const description = category?.description?.toLowerCase() || "";

      return (
        name.includes(search) ||
        description.includes(search)
      );
    });
  }, [categories, searchTerm]);

  const activeCount = categories.filter(
    (category) => category?.isActive !== false
  ).length;

  const inactiveCount = categories.length - activeCount;

  // ===============================
  // UI
  // ===============================

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-header">
        <div>
          <span className="admin-page-eyebrow">CONTENT MANAGEMENT</span>

          <h1>Categories</h1>

          <p>
            Organize your courses into categories and manage their visibility.
          </p>
        </div>

        <button
          type="button"
          className="categories-refresh-btn"
          onClick={fetchCategories}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="categories-stats">
        <div className="category-stat-card">
          <div className="category-stat-icon total-icon">▦</div>

          <div>
            <p>Total Categories</p>
            <h2>{categories.length}</h2>
          </div>
        </div>

        <div className="category-stat-card">
          <div className="category-stat-icon active-icon">✓</div>

          <div>
            <p>Active Categories</p>
            <h2>{activeCount}</h2>
          </div>
        </div>

        <div className="category-stat-card">
          <div className="category-stat-icon inactive-icon">◷</div>

          <div>
            <p>Inactive Categories</p>
            <h2>{inactiveCount}</h2>
          </div>
        </div>
      </div>

      {/* MESSAGE */}

      {error && (
        <div className="categories-message error-message">
          {error}
          <button type="button" onClick={fetchCategories}>
            Try again
          </button>
        </div>
      )}

      {message && (
        <div className="categories-message">
          {message}
        </div>
      )}

      {/* CREATE / EDIT FORM */}

      <section className="category-form-card">
        <div className="category-section-heading">
          <div>
            <h2>
              {editingCategory ? "Edit Category" : "Create Category"}
            </h2>

            <p>
              {editingCategory
                ? "Update the selected category details."
                : "Add a new category to organize your courses."}
            </p>
          </div>

          {editingCategory && (
            <button
              type="button"
              className="category-cancel-btn"
              onClick={resetForm}
            >
              Cancel editing
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="category-form-grid">
            <div className="category-form-field">
              <label htmlFor="category-name">
                Category Name <span>*</span>
              </label>

              <input
                id="category-name"
                type="text"
                name="name"
                placeholder="Example: Web Development"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>

            <div className="category-form-field">
              <label htmlFor="category-description">
                Description
              </label>

              <textarea
                id="category-description"
                name="description"
                placeholder="Describe what courses belong to this category..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <div className="category-form-actions">
            <button
              type="submit"
              className="category-submit-btn"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingCategory
                  ? "Update Category"
                  : "Create Category"}
            </button>

            <button
              type="button"
              className="category-reset-btn"
              onClick={resetForm}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* CATEGORY TABLE */}

      <section className="category-table-card">
        <div className="category-section-heading category-table-heading">
          <div>
            <h2>All Categories</h2>

            <p>
              Manage the categories available in your marketplace.
            </p>
          </div>

          <div className="category-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="categories-empty-state">
            Loading categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="categories-empty-state">
            <div className="categories-empty-icon">▦</div>

            <h3>No categories found</h3>

            <p>
              {searchTerm
                ? "Try changing your search term."
                : "Create your first category using the form above."}
            </p>
          </div>
        ) : (
          <div className="categories-table-wrapper">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Category ID</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category, index) => {
                  const categoryId = getCategoryId(category);
                  const isActive = category?.isActive !== false;

                  return (
                    <tr key={categoryId || index}>
                      <td>
                        <div className="category-name-cell">
                          <div className="category-avatar">
                            {(category?.name || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>
                            {category?.name || "Unnamed category"}
                          </strong>
                        </div>
                      </td>

                      <td className="category-description-cell">
                        {category?.description || "No description provided"}
                      </td>

                      <td>
                        <span
                          className={`category-status ${
                            isActive ? "status-active" : "status-inactive"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="category-id-cell">
                        {categoryId || "Not provided"}
                      </td>

                      <td>
                        <div className="category-action-buttons">
                          <button
                            type="button"
                            className="category-edit-btn"
                            onClick={() => handleEdit(category)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="category-toggle-btn"
                            onClick={() => handleToggleStatus(category)}
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            type="button"
                            className="category-delete-btn"
                            onClick={() => handleDelete(category)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="categories-table-footer">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      </section>
    </div>
  );
}

export default AdminCategories;