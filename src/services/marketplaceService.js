
import api from "../api/axios";

const PURCHASES_KEY_PREFIX = "learnhub_purchases_";

// Identify the currently logged-in account.
function getAccountId() {
  const token = localStorage.getItem("accessToken");

  if (!token) return null;

  try {
    const payloadPart = token.split(".")[1];

    if (payloadPart) {
      const base64 = payloadPart
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const paddedBase64 = base64.padEnd(
        Math.ceil(base64.length / 4) * 4,
        "="
      );

      const payload = JSON.parse(atob(paddedBase64));

      const accountId =
        payload.user?._id ||
        payload.user?.id ||
        payload._id ||
        payload.id ||
        payload.userId ||
        payload.sub ||
        payload.email;

      if (accountId) {
        return String(accountId).toLowerCase();
      }
    }
  } catch {
    // Use the token-derived fallback below.
  }

  let hash = 0;

  for (let index = 0; index < token.length; index++) {
    hash = (hash * 31 + token.charCodeAt(index)) | 0;
  }

  return `account_${Math.abs(hash)}`;
}

function getPurchasesKey() {
  const accountId = getAccountId();

  return accountId
    ? `${PURCHASES_KEY_PREFIX}${accountId}`
    : null;
}

// Get the user's wishlist.
export async function getWishlist() {
  const response = await api.get("/api/v1/lms/wishlist");

  return Array.isArray(response.data?.wishlist)
    ? response.data.wishlist
    : [];
}

// Fetch wishlist courses along with their course details.
export async function getWishlistCourses() {
  const wishlistItems = await getWishlist();

  const courseResults = await Promise.all(
    wishlistItems.map(async (item) => {
      try {
        const response = await api.get(
          `/api/v1/course/get-course/${item.courseId}`
        );

        const data = response.data?.data ?? response.data;
        const course = data?.course ?? data;

        if (!course || !course._id) return null;

        return {
          ...course,
          wishlistId: item._id,
          addedAt: item.addedAt,
        };
      } catch (error) {
        console.error(
          `Unable to load course ${item.courseId}:`,
          error.response?.data || error
        );

        return null;
      }
    })
  );

  return courseResults.filter(Boolean);
}

// Add or remove a course from the wishlist.
export async function toggleWishlist(courseId) {
  const response = await api.post(
    "/api/v1/lms/wishlist/toggle",
    { courseId }
  );

  return response.data;
}

export async function removeWishlistCourse(courseId) {
  return toggleWishlist(courseId);
}

// Get course details.
export async function getCourseById(courseId) {
  const response = await api.get(
    `/api/v1/course/get-course/${courseId}`
  );

  const data = response.data?.data ?? response.data;

  return data?.course ?? data ?? null;
}

// Get course sections and lectures.
export async function getCourseContent(courseId) {
  const response = await api.get(
    `/api/v1/course/get-course-content/${courseId}`
  );

  const contentData =
    response.data?.content ??
    response.data?.courseContent ??
    response.data?.data?.content ??
    response.data?.data;

  if (Array.isArray(contentData)) {
    return contentData;
  }

  if (Array.isArray(contentData?.sections)) {
    return contentData.sections;
  }

  if (Array.isArray(contentData?.courseData)) {
    return contentData.courseData;
  }

  return [];
}

// Read purchased courses for the current account.
export function getPurchases() {
  const key = getPurchasesKey();

  if (!key) return [];

  try {
    const stored = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

// Add a course to the current account's purchases.
export function addPurchase(course) {
  const key = getPurchasesKey();

  if (!key) {
    throw new Error(
      "Please log in before purchasing a course."
    );
  }

  const purchases = getPurchases();
  const courseId = course?._id;

  if (!courseId) {
    throw new Error("Course ID is missing.");
  }

  const alreadyExists = purchases.some(
    (item) => item.courseId === courseId
  );

  if (!alreadyExists) {
    purchases.unshift({
      courseId,
      name: course.name,
      description: course.description,
      price: course.price,
      thumbnail: course.thumbnail,
      purchasedAt: new Date().toISOString(),
    });

    localStorage.setItem(key, JSON.stringify(purchases));
  }

  return getPurchases();
}

// Backward-compatible exports for existing pages.
export const getDemoPurchases = getPurchases;
export const addDemoPurchase = addPurchase;
